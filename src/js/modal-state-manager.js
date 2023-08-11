class OverlayVisibilityManager {
	constructor () {
		this.OVERLAY_MODAL_ELEMENT = null;
		this.OVERLAY_SHADOW_ELEMENT = null;
		this.OVERLAY_FRAGMENT = null;
		this.DOWNLOAD_FORMAT = '';
		this.USER_DATA = '';
	}

	showOverlay (overlayFragment) {
		this.OVERLAY_FRAGMENT = overlayFragment;
		this.OVERLAY_MODAL_ELEMENT =
			this.OVERLAY_FRAGMENT.lastElementChild || this.OVERLAY_FRAGMENT.lastChild;
		this.OVERLAY_SHADOW_ELEMENT =
			this.OVERLAY_FRAGMENT.firstElementChild || this.OVERLAY_FRAGMENT.firstChild;

		document.body.appendChild(this.OVERLAY_FRAGMENT);
		this.reposition();
	}

	hideOverlay () {
		if (this.isOverlayVisible()) {
			this.OVERLAY_MODAL_ELEMENT.remove();
			this.OVERLAY_SHADOW_ELEMENT.remove();
			this.OVERLAY_FRAGMENT = null;
			this.OVERLAY_MODAL_ELEMENT = null;
			this.OVERLAY_SHADOW_ELEMENT = null;
		}
	}

	isOverlayVisible () {
		return !!(
			this.OVERLAY_MODAL_ELEMENT && document.body.contains(this.OVERLAY_MODAL_ELEMENT)
		);
	}

	delayModalHide (ms = 500) {
		let tid = setTimeout(() => {
			clearTimeout(tid);
			tid = null;

			this.hideOverlay();
		}, ms);
	}


	reposition () {
		if (!this.isOverlayVisible()) {
			return;
		}
		const DOC_EL = document.documentElement;
		let x = DOC_EL.clientWidth / 2 - this.OVERLAY_MODAL_ELEMENT.clientWidth / 2;
		let y = Math.max(
			DOC_EL.clientHeight / 3 - this.OVERLAY_MODAL_ELEMENT.clientHeight / 2,
			100
		);
		this.OVERLAY_MODAL_ELEMENT.style.left = `${x}px`;
		this.OVERLAY_MODAL_ELEMENT.style.top = `${y}px`;
	}

	shouldPreventDefault (el) {
		while (el) {
			if (el.tagName && el.tagName.toUpperCase() === 'A') {
				return true;
			}
			el = el.parentElement;
		}
		return false;
	}
}


export default OverlayVisibilityManager;
