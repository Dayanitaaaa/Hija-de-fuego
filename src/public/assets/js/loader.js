// Loader de fogata - funcionalidad global
document.addEventListener('DOMContentLoaded', function () {
	const body = document.body;

	function ensureLoader() {
		let loader = document.getElementById('pageLoader');
		if (loader) return loader;

		const loaderHTML = `
			<div class="page-loader" id="pageLoader">
				<div class="campfire-loader">
					<div class="fire-container">
						<div class="flame flame-main"></div>
						<div class="flame flame-left"></div>
						<div class="flame flame-right"></div>
					</div>
					<div class="logs">
						<div class="log"></div>
						<div class="log"></div>
					</div>
					<div class="embers">
						<div class="ember"></div>
						<div class="ember"></div>
						<div class="ember"></div>
						<div class="ember"></div>
					</div>
					<div class="sparkles"></div>
				</div>
			</div>
		`;

		body.insertAdjacentHTML('afterbegin', loaderHTML);
		return document.getElementById('pageLoader');
	}

	function showLoader() {
		const loader = ensureLoader();
		if (!loader) return;
		loader.classList.remove('hidden');
		body.classList.add('loading');
	}

	function hideLoader() {
		const loader = document.getElementById('pageLoader');
		if (loader) loader.classList.add('hidden');
		body.classList.remove('loading');
	}

	// Exponer para uso opcional
	window.__showBrandLoader = showLoader;
	window.__hideBrandLoader = hideLoader;

	// 1) Loader al terminar de cargar la página (opcional)
	// Para desactivar en una página específica, antes de cargar loader.js define:
	// window.DISABLE_LOADER_ON_LOAD = true;
	const disableOnLoad = window.DISABLE_LOADER_ON_LOAD === true;
	if (!disableOnLoad) {
		showLoader();
		window.addEventListener('load', function () {
			setTimeout(function () {
				hideLoader();
			}, 800);
		});
	}

	// 2) Loader al navegar (links internos)
	document.addEventListener('click', function (e) {
		const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
		if (!a) return;
		if (a.hasAttribute('download')) return;
		if (a.getAttribute('target') === '_blank') return;

		const href = a.getAttribute('href');
		if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

		let url;
		try {
			url = new URL(href, window.location.href);
		} catch {
			return;
		}

		// solo navegación interna
		if (url.origin !== window.location.origin) return;
		if (url.href === window.location.href) return;

		e.preventDefault();
		showLoader();
		requestAnimationFrame(function () {
			setTimeout(function () {
				window.location.href = url.href;
			}, 50);
		});
	});
});
