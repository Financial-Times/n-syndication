const dataSource = require('../../../src/js/data-store');

describe('./src/js/data-store', function () {
	const USER_DATA = { contract_id: '123', MAINTENANCE_MODE: false };
	beforeEach( () => {
		dataSource.USER_DATA = USER_DATA;
		jest.spyOn(dataSource, 'refresh');
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('init should be a Function', function () {
		expect(typeof dataSource.init).toBe('function');
	});

	test('init should initialize USER_DATA and call refresh with data when data is an array', function () {
		const data = [
			{ id: '1', lang: 'en' },
			{ id: '2', lang: 'fr' },
		];

		dataSource.init(dataSource.USER_DATA, data);

		expect(dataSource.refresh).toHaveBeenCalledWith(data);
		expect(dataSource.refresh).toHaveBeenCalledTimes(1);
	});

	test('init should initialize USER_DATA and not call refresh when data is not an array', function () {
		const data = {};
		dataSource.init(dataSource.USER_DATA, data);

		expect(dataSource.refresh).not.toHaveBeenCalled();
	});

	test('fetchItems should return fake response when USER_DATA.MAINTENANCE_MODE is true', async function () {
		dataSource.USER_DATA.MAINTENANCE_MODE = true;
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

		const response = await dataSource.fetchItems(itemIDs);
		expect(response).toEqual(expectedResponse);
		expect(fetch).not.toHaveBeenCalled();
	});

	test('fetchItems should make a fetch request and return the response when USER_DATA.MAINTENANCE_MODE is false', async function () {
		dataSource.USER_DATA.MAINTENANCE_MODE = false;
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
		const response = await dataSource.fetchItems(itemIDs);
		expect(response).toEqual(expectedResponse);
		expect(fetch).toHaveBeenCalledTimes(1);
	});

	test('fetchItems should handle error when fetch request fails', async function () {
		dataSource.USER_DATA.MAINTENANCE_MODE = false;
		const itemIDs = ['1', '2', '3'];
		global.fetch = jest.fn().mockImplementation(() => {
			return Promise.resolve({
				ok: false,
				text: () => Promise.reject(new Error('Network Error')),
			});
		});
		try {
			await dataSource.fetchItems(itemIDs);
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

	test('getAllItemsForID should call the corresponding data store method', function () {
		const itemID = '1';
		const expectedValue = [
			{
				__id__: '1__en',
				title: 'Item 1',
				id: '1',
			},
		];
		dataSource.USER_DATA = [
			{
				__id__: '1__en',
				title: 'Item 1',
				id: '1',
			},
		];

		const result = dataSource.getAllItemsForID(itemID);

		expect(result).toEqual(expectedValue);
	});

	test('getItemByHTMLElement should call the corresponding data store method', function () {
		const element = document.createElement('div');
		const expectedValue = { id: '1', title: 'Item 1' };

		jest.spyOn(dataSource, 'getItemByID').mockReturnValueOnce(expectedValue);
		const result = dataSource.getItemByHTMLElement(element);

		expect(result).toEqual(expectedValue);
		expect(dataSource.getItemByID).toHaveBeenCalled();
	});

	test('getItemByID should call the corresponding data store method', function () {
		const itemID = '1';
		const expectedValue = {
			id: '1',
			__id__: '1__en',
			title: 'Item 1',
		};

		const result = dataSource.getItemByID(itemID);
		expect(result).toEqual(expectedValue);
	});

	test('getItemIndex should call the corresponding data store method', function () {
		const itemID = '1';
		const expectedValue = -1;

		const result = dataSource.getItemIndex(itemID);

		expect(result).toEqual(expectedValue);
	});

	test('getUserData should call the corresponding data store method', function () {
		const expectedValue = {
			MAINTENANCE_MODE: false,
			contract_id: '123',
		};

		const result = dataSource.getUserData();

		expect(result).toEqual(expectedValue);
	});
});
