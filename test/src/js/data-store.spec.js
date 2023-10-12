import {
	DATA_STORE,
	DATA_STORE_MAP,
	USER_DATA,
	fetchItems,
	getAllItemsForID,
	getItemByHTMLElement,
	getItemByID,
	getItemIndex,
	getUserData,
	init,
	refresh,
} from '../../../src/js/data-store';

describe('Data Store Module', () => {
	beforeEach(() => {
		DATA_STORE.length = 0;
		Object.keys(DATA_STORE_MAP).forEach((key) => delete DATA_STORE_MAP[key]);
	});
	afterEach(() => {
		jest.clearAllMocks();
	});
	describe('init', () => {
		it('should initialize USER_DATA and call refresh if data is provided', () => {
			const user = { MAINTENANCE_MODE: true };
			const data = [{ id: 1 }];
			init(user, data);

			expect(USER_DATA).toEqual(user);
			expect(DATA_STORE).toEqual(data);
		});
		it('init should be a Function', function () {
			expect(typeof init).toBe('function');
		});
		it('should register the "nSyndication.fetch" event listener', () => {
			const user = { MAINTENANCE_MODE: false };
			const eventListenerSpy = jest.spyOn(window, 'addEventListener');

			init(user);

			expect(eventListenerSpy).toHaveBeenCalledWith(
				'nSyndication.fetch',
				expect.any(Function),
				true
			);
		});
	});


	describe('fetchItems Function', () => {
		it('fetchItems should return fake response when USER_DATA.MAINTENANCE_MODE is true', async function () {
			USER_DATA.MAINTENANCE_MODE = true;
			const itemIDs = ['1', '2', '3'];
			const expectedResponse = [
				{
					id: '1',
					__id__: '1__en',
					canBeSyndicated: 'maintenance',
					messageCode: 'MSG_5100',
				},
				{
					id: '2',
					__id__: '2__en',
					canBeSyndicated: 'maintenance',
					messageCode: 'MSG_5100',
				},
				{
					id: '3',
					__id__: '3__en',
					canBeSyndicated: 'maintenance',
					messageCode: 'MSG_5100',
				},
			];

			const mockResponse = {
				ok: true,
				status: 200,
			};
			global.fetch = jest.fn().mockResolvedValue(mockResponse);

			const response = await fetchItems(itemIDs);
			expect(response).toEqual(expectedResponse);
			expect(fetch).not.toHaveBeenCalled();
		});

		it('fetchItems should make a fetch request and return the response when USER_DATA.MAINTENANCE_MODE is false', async function () {
			USER_DATA.MAINTENANCE_MODE = false;
			const itemIDs = ['1', '2', '3'];
			const expectedResponse = [
				{ id: '1', title: 'Item 1' },
				{ id: '2', title: 'Item 2' },
				{ id: '3', title: 'Item 3' },
			];

			global.fetch = jest.fn().mockImplementation(() => {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve(expectedResponse),
				});
			});
			const response = await fetchItems(itemIDs);
			expect(response).toEqual(expectedResponse);
			expect(fetch).toHaveBeenCalledTimes(1);
		});

		it('fetchItems should handle error when fetch request fails', async function () {
			USER_DATA.MAINTENANCE_MODE = false;
			const itemIDs = ['1', '2', '3'];
			global.fetch = jest.fn().mockImplementation(() => {
				return Promise.resolve({
					ok: false,
					text: () => Promise.reject(new Error('Network Error')),
				});
			});
			try {
				await fetchItems(itemIDs);
			} catch (e) {
				expect(fetch).toHaveBeenCalledWith(
					expect.any(String),
					expect.objectContaining({
						method: 'POST',
						body: JSON.stringify(itemIDs),
					})
				);
				expect(fetch).toHaveBeenCalledTimes(1);
			}
		});
	});
	describe('getItemByHTMLElement', () => {
		it('should return the item corresponding to the given HTML element', () => {
			const item = { id: '1', lang: 'en', title: 'item 1' };
			DATA_STORE.push(item);
			const el = document.createElement('div');
			el.setAttribute('data-content-id', '1');

			const result = getItemByHTMLElement(el);

			expect(result).toEqual(item);
		});
	});

	describe('getAllItemsForID', () => {
		it('should return an array of items with the given ID', () => {
			const id = '1';
			const items = [{ id: '1' }, { id: '1', lang: 'en' }, { id: '2' }];
			DATA_STORE.push(...items);

			const result = getAllItemsForID(id);

			expect(result).toEqual([items[0], items[1]]);
		});
	});

	describe('getItemByID', () => {
		it('should return the item with the given ID and language', () => {
			const id = '1';
			const lang = 'en';
			const item = { id: '1', lang: 'en' };
			DATA_STORE.push(item);

			const result = getItemByID(id, lang);

			expect(result).toEqual(item);
		});

		it('should return the item with the given ID (default language "en")', () => {
			const id = '1';
			const item = { id: '1', lang: 'en' };
			DATA_STORE.push(item);

			const result = getItemByID(id);

			expect(result).toEqual(item);
		});

		it('should return null if no matching item is found', () => {
			const id = '1';
			const lang = 'en';

			const result = getItemByID(id, lang);

			expect(result).toBeNull();
		});
	});

	describe('getItemIndex', () => {
		it('should return the index of the item in DATA_STORE', () => {
			const item = { id: 1, lang: 'en' };
			DATA_STORE.push(item);

			const result = getItemIndex(item);

			expect(result).toBe(0);
		});

		it('should return -1 if the item is not found in DATA_STORE', () => {
			const item = { id: 1 };

			const result = getItemIndex(item);

			expect(result).toBe(-1);
		});
	});

	describe('getUserData', () => {
		it('should return the USER_DATA object', () => {
			USER_DATA = { MAINTENANCE_MODE: false };
			const result = getUserData();

			expect(result).toEqual(USER_DATA);
		});
	});

	describe('refresh', () => {
		it('should update DATA_STORE and DATA_STORE_MAP with new data', () => {
			const data = [{ id: 1 }, { id: 2 }];

			const result = refresh(data);

			expect(DATA_STORE).toEqual(data);
			expect(DATA_STORE_MAP).toEqual({
				'1__en': data[0],
				'2__en': data[1],
			});
			expect(result).toEqual({
				EXISTING: [],
				DATA_STORE: data,
				DATA_STORE_MAP: {
					'1__en': data[0],
					'2__en': data[1],
				},
			});
		});
	});
});
