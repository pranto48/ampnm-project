function initNetworkGraphs() {
    const graphCards = document.querySelectorAll('.graph-card');

    graphCards.forEach((card) => {
        const frame = card.querySelector('.graph-frame');
        const rangePill = card.querySelector('.range-pill');
        const openLink = card.querySelector('.graph-open-link');
        const buttons = card.querySelectorAll('.range-button');

        function setRange(range) {
            const datasetKey = `${range}Url`;
            const targetUrl = card.dataset[datasetKey];

            if (!targetUrl) return;

            if (frame) {
                frame.src = targetUrl;
            }

            if (openLink) {
                openLink.href = targetUrl;
            }

            if (rangePill) {
                rangePill.textContent = range.charAt(0).toUpperCase() + range.slice(1);
            }

            buttons.forEach((btn) => {
                if (btn.dataset.range === range) {
                    btn.classList.add('bg-slate-700', 'text-white');
                } else {
                    btn.classList.remove('bg-slate-700', 'text-white');
                }
            });
        }

        buttons.forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const range = button.dataset.range;
                setRange(range);
            });
        });

        // Initialize with daily view
        setRange('daily');
    });
}
