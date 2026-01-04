// Глобальные переменные
let currencies = [];
let cryptos = [];
let news = [];

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadCurrencies();
    loadCrypto();
    loadNews();

    // Автообновление каждые 60 секунд
    setInterval(() => {
        refreshCurrencies();
        refreshCrypto();
    }, 60000);

    // Слушатель для калькулятора
    document.getElementById('from-amount')?.addEventListener('input', convert);
    document.getElementById('from-currency')?.addEventListener('change', convert);
    document.getElementById('to-currency')?.addEventListener('change', convert);
});

// ========== ВАЛЮТЫ ==========

async function loadCurrencies() {
    try {
        const response = await fetch('/api/currencies');
        currencies = await response.json();

        displayCurrencies();
        populateCurrencySelects();
        updateCounts();
    } catch (error) {
        console.error('Ошибка загрузки валют:', error);
    }
}

async function refreshCurrencies() {
    try {
        const btn = event?.target;
        if (btn) {
            btn.disabled = true;
            btn.textContent = '⏳ Обновляю...';
        }

        const response = await fetch('/api/currencies/refresh');
        const data = await response.json();
        currencies = data.currencies;

        displayCurrencies();

        if (btn) {
            btn.disabled = false;
            btn.textContent = '🔄 Обновить';
        }
    } catch (error) {
        console.error('Ошибка обновления валют:', error);
    }
}

function displayCurrencies() {
    const grid = document.getElementById('rates-grid');
    if (!grid) return;

    grid.innerHTML = currencies.map(currency => {
        const rateToRub = (1 / currency.rate_to_usd * 90.91).toFixed(2); // Примерный курс к рублю
        const rateToUsd = currency.rate_to_usd.toFixed(4);

        return `
            <div class="currency-card">
                <div class="currency-header">
                    <div class="currency-symbol">${currency.symbol}</div>
                    <div class="currency-name">
                        <strong>${currency.code}</strong>
                        <span>${currency.name}</span>
                    </div>
                </div>
                <div class="currency-rate">
                    <div class="rate-item">
                        <span class="rate-label">К USD:</span>
                        <span class="rate-value">${rateToUsd}</span>
                    </div>
                    <div class="rate-item">
                        <span class="rate-label">К RUB:</span>
                        <span class="rate-value">${rateToRub}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const updated = document.getElementById('rates-updated');
    if (updated && currencies.length > 0) {
        const lastUpdate = new Date(currencies[0].last_updated);
        updated.textContent = `Обновлено: ${formatDateTime(lastUpdate)}`;
    }
}

function populateCurrencySelects() {
    const fromSelect = document.getElementById('from-currency');
    const toSelect = document.getElementById('to-currency');

    if (!fromSelect || !toSelect) return;

    // Добавляем фиатные валюты
    const currencyOptions = currencies.map(c =>
        `<option value="${c.code}">${c.code} - ${c.name}</option>`
    ).join('');

    // Добавляем криптовалюты
    const cryptoOptions = cryptos.map(c =>
        `<option value="${c.symbol}">${c.symbol} - ${c.name}</option>`
    ).join('');

    const allOptions = `
        <optgroup label="Фиатные валюты">
            ${currencyOptions}
        </optgroup>
        <optgroup label="Криптовалюты">
            ${cryptoOptions}
        </optgroup>
    `;

    fromSelect.innerHTML = allOptions;
    toSelect.innerHTML = allOptions;

    // Устанавливаем значения по умолчанию
    fromSelect.value = 'USD';
    toSelect.value = 'RUB';
}

// ========== КРИПТОВАЛЮТЫ ==========

async function loadCrypto() {
    try {
        const response = await fetch('/api/crypto');
        cryptos = await response.json();

        displayCrypto();
        populateCurrencySelects();
        updateCounts();
    } catch (error) {
        console.error('Ошибка загрузки крипты:', error);
    }
}

async function refreshCrypto() {
    try {
        const btn = event?.target;
        if (btn) {
            btn.disabled = true;
            btn.textContent = '⏳ Обновляю...';
        }

        const response = await fetch('/api/crypto/refresh');
        const data = await response.json();
        cryptos = data.cryptos;

        displayCrypto();

        if (btn) {
            btn.disabled = false;
            btn.textContent = '🔄 Обновить';
        }
    } catch (error) {
        console.error('Ошибка обновления крипты:', error);
    }
}

function displayCrypto() {
    const grid = document.getElementById('crypto-grid');
    if (!grid) return;

    grid.innerHTML = cryptos.map(crypto => {
        const priceChange = parseFloat(crypto.price_change_24h);
        const changeClass = priceChange >= 0 ? 'positive' : 'negative';
        const changeIcon = priceChange >= 0 ? '📈' : '📉';

        return `
            <div class="crypto-card">
                <div class="crypto-header">
                    <div class="crypto-symbol">${crypto.symbol}</div>
                    <div class="crypto-name">${crypto.name}</div>
                </div>
                <div class="crypto-price">
                    $${formatNumber(crypto.current_price_usd)}
                </div>
                <div class="crypto-change ${changeClass}">
                    ${changeIcon} ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%
                </div>
                <div class="crypto-stats">
                    <div class="stat">
                        <span class="stat-label">Капитализация:</span>
                        <span class="stat-value">$${formatLargeNumber(crypto.market_cap)}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Объем 24ч:</span>
                        <span class="stat-value">$${formatLargeNumber(crypto.volume_24h)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const updated = document.getElementById('crypto-updated');
    if (updated && cryptos.length > 0) {
        const lastUpdate = new Date(cryptos[0].last_updated);
        updated.textContent = `Обновлено: ${formatDateTime(lastUpdate)}`;
    }
}

// ========== КАЛЬКУЛЯТОР ==========

async function convert() {
    const fromAmount = parseFloat(document.getElementById('from-amount').value) || 0;
    const fromCurrency = document.getElementById('from-currency').value;
    const toCurrency = document.getElementById('to-currency').value;

    if (fromAmount === 0) {
        document.getElementById('to-amount').value = '0';
        return;
    }

    try {
        const response = await fetch('/api/calculator/convert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from: fromCurrency,
                to: toCurrency,
                amount: fromAmount
            })
        });

        const data = await response.json();

        document.getElementById('to-amount').value = data.converted_amount.toFixed(8);

        const result = document.getElementById('calc-result');
        result.innerHTML = `
            <div class="calc-info">
                <p><strong>Курс:</strong> 1 ${fromCurrency} = ${data.rate.toFixed(8)} ${toCurrency}</p>
                <p><strong>Результат:</strong> ${formatNumber(fromAmount)} ${fromCurrency} = ${formatNumber(data.converted_amount)} ${toCurrency}</p>
                ${data.is_crypto ? '<p class="crypto-badge">💎 Включает криптовалюту</p>' : ''}
            </div>
        `;
    } catch (error) {
        console.error('Ошибка конвертации:', error);
        document.getElementById('calc-result').innerHTML =
            '<p class="error">Ошибка при конвертации. Попробуйте еще раз.</p>';
    }
}

function swapCurrencies() {
    const fromSelect = document.getElementById('from-currency');
    const toSelect = document.getElementById('to-currency');

    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;

    convert();
}

// ========== НОВОСТИ ==========

async function loadNews() {
    try {
        const response = await fetch('/api/news');
        news = await response.json();

        displayNews();
        updateCounts();
    } catch (error) {
        console.error('Ошибка загрузки новостей:', error);
    }
}

async function refreshNews() {
    try {
        const btn = event?.target;
        if (btn) {
            btn.disabled = true;
            btn.textContent = '⏳ Обновляю...';
        }

        const response = await fetch('/api/news/refresh');
        const data = await response.json();
        news = data.news;

        displayNews();

        if (btn) {
            btn.disabled = false;
            btn.textContent = '🔄 Обновить';
        }
    } catch (error) {
        console.error('Ошибка обновления новостей:', error);
    }
}

function displayNews() {
    const grid = document.getElementById('news-grid');
    if (!grid) return;

    grid.innerHTML = news.map(article => {
        const publishedDate = new Date(article.published_at);
        const categoryIcon = getCategoryIcon(article.category);

        return `
            <div class="news-card">
                <div class="news-header">
                    <span class="news-category">${categoryIcon} ${article.category}</span>
                    <span class="news-source">${article.source}</span>
                </div>
                <h3 class="news-title">${article.title}</h3>
                <p class="news-description">${article.description || ''}</p>
                <div class="news-footer">
                    <span class="news-date">${formatDate(publishedDate)}</span>
                    <a href="${article.url}" target="_blank" class="news-link">Читать далее →</a>
                </div>
            </div>
        `;
    }).join('');
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    const number = parseFloat(num);
    if (number >= 1000) {
        return number.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
    }
    return number.toFixed(2);
}

function formatLargeNumber(num) {
    if (num === null || num === undefined) return '0';
    const number = parseFloat(num);

    if (number >= 1e12) return (number / 1e12).toFixed(2) + 'T';
    if (number >= 1e9) return (number / 1e9).toFixed(2) + 'B';
    if (number >= 1e6) return (number / 1e6).toFixed(2) + 'M';
    if (number >= 1e3) return (number / 1e3).toFixed(2) + 'K';
    return number.toFixed(2);
}

function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('ru-RU', options);
}

function formatDateTime(date) {
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('ru-RU', options);
}

function getCategoryIcon(category) {
    const icons = {
        'monetary-policy': '🏦',
        'cryptocurrency': '₿',
        'forex': '💱',
        'stocks': '📊',
        'commodities': '🥇',
        'finance': '💰'
    };
    return icons[category] || '📰';
}

function updateCounts() {
    const currenciesCount = document.getElementById('currencies-count');
    const cryptoCount = document.getElementById('crypto-count');
    const newsCount = document.getElementById('news-count');

    if (currenciesCount) currenciesCount.textContent = currencies.length;
    if (cryptoCount) cryptoCount.textContent = cryptos.length;
    if (newsCount) newsCount.textContent = news.length;
}

// Плавная прокрутка для навигации
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
