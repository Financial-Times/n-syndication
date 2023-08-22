
import OverlayVisibilityManager from '../../../src/js/modal-state-manager';

describe('OverlayVisibilityManager', () => {
	let overlayManager;
	const createMockElement = () => ({
		appendChild: jest.fn(),
		remove: jest.fn(),
		style: {},
		lastElementChild: null,
		firstElementChild: null,
		contains: jest.fn(),
		clientWidth: 800,
		clientHeight: 600
	});

	beforeEach(() => {
		overlayManager = new OverlayVisibilityManager();

		const mockElement = createMockElement();

		jest.spyOn(document.body, 'appendChild').mockImplementation(mockElement.appendChild);
		jest.spyOn(document.body, 'removeChild').mockImplementation(mockElement.remove);
		jest.spyOn(document.body, 'contains').mockImplementation(mockElement.contains);

	});
	afterEach(()=>{
		jest.clearAllMocks();
	});

	describe('showOverlay', () => {
		it('should append the overlay fragment to the body', () => {
			const mockOverlay = createMockElement();
			overlayManager.showOverlay(mockOverlay);
			expect(document.body.appendChild).toHaveBeenCalledWith(mockOverlay);
		});
	});

	describe('hideOverlay', () => {
		it('should remove overlay if it is visible', () => {
			const mockOverlay = createMockElement();
			overlayManager.OVERLAY_MODAL_ELEMENT = mockOverlay;
			overlayManager.OVERLAY_SHADOW_ELEMENT = mockOverlay;
			const spy =jest.spyOn(OverlayVisibilityManager.prototype, 'isOverlayVisible').mockReturnValue(true);
			overlayManager.hideOverlay();
			expect(mockOverlay.remove).toHaveBeenCalledTimes(2);
			spy.mockRestore();
		});

		it('should not remove overlay if it is not visible', () => {
			overlayManager.hideOverlay();
			expect(document.body.removeChild).not.toHaveBeenCalled();
		});
	});

	describe('isOverlayVisible', () => {
		it('should return true if overlay is visible', () => {
			overlayManager.OVERLAY_MODAL_ELEMENT = createMockElement();
			document.body.contains.mockReturnValue(true);
			expect(overlayManager.isOverlayVisible()).toBe(true);
		});

		it('should return false if overlay is not visible', () => {
			expect(overlayManager.isOverlayVisible()).toBe(false);
		});
	});

	describe('delayModalHide', () => {
		jest.useFakeTimers();

		it('should hide overlay after a delay', () => {
			const mockOverlay = createMockElement();
			overlayManager.OVERLAY_MODAL_ELEMENT = mockOverlay;
			overlayManager.OVERLAY_SHADOW_ELEMENT = mockOverlay;

			const hideOverlaySpy = jest.spyOn(overlayManager, 'hideOverlay');

			overlayManager.delayModalHide(100);
			jest.runAllTimers();

			expect(hideOverlaySpy).toHaveBeenCalledTimes(1);

			hideOverlaySpy.mockRestore();
		});
	});

	describe('reposition', () => {
		it('should reposition the overlay if it is visible', () => {
			overlayManager.OVERLAY_MODAL_ELEMENT = createMockElement();
			document.body.contains.mockReturnValue(true);
			overlayManager.reposition();
			expect(overlayManager.OVERLAY_MODAL_ELEMENT.style.left).toBe('-400px');
			expect(overlayManager.OVERLAY_MODAL_ELEMENT.style.top).toBe('100px');
		});

		it('should not reposition the overlay if it is not visible', () => {
			const spy = jest.spyOn(OverlayVisibilityManager.prototype, 'isOverlayVisible').mockReturnValue(false);
			overlayManager.reposition();
			expect(overlayManager.OVERLAY_MODAL_ELEMENT).toBe(null);
			spy.mockRestore();
		});
	});

	describe('shouldPreventDefault', () => {
		it('should return true if element is a link', () => {
			const mockLinkElement = {
				tagName: 'A',
				parentElement: null
			};
			expect(overlayManager.shouldPreventDefault(mockLinkElement)).toBe(true);
		});

		it('should return false if element is not a link', () => {
			const mockDivElement = {
				tagName: 'DIV',
				parentElement: null
			};
			expect(overlayManager.shouldPreventDefault(mockDivElement)).toBe(false);
		});

		it('should return true if a parent element is a link', () => {
			const mockChildElement = {
				parentElement: {
					tagName: 'A',
					parentElement: null
				}
			};
			expect(overlayManager.shouldPreventDefault(mockChildElement)).toBe(true);
		});
	});
});
