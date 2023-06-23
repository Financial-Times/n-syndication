import getUserStatus from '../../../src/js/get-user-status';
import {broadcast} from 'n-ui-foundations';

jest.mock('n-ui-foundations', () => ({
	broadcast: jest.fn(),
}));

describe('./src/js/get-user-status', () => {
	test('getUserStatus should return user status when response is OK', async () => {
		const mockResponse = {
			ok: true,
			json: jest.fn().mockResolvedValue({status: 'active'}),
		};
		global.fetch = jest.fn().mockResolvedValue(mockResponse);

		const userStatus = await getUserStatus();

		expect(fetch).toHaveBeenCalledWith('/syndication/user-status', {
			credentials: 'include',
		});
		expect(mockResponse.json).toHaveBeenCalled();
		expect(userStatus).toEqual({status: 'active'});
		expect(broadcast).not.toHaveBeenCalled();
	});

	test('getUserStatus should return null when response status is 401', async () => {
		const mockResponse = {
			ok: false,
			status: 401,
		};
		global.fetch = jest.fn().mockResolvedValue(mockResponse);

		const userStatus = await getUserStatus();

		expect(fetch).toHaveBeenCalledWith('/syndication/user-status', {
			credentials: 'include',
		});
		expect(userStatus).toBeNull();
		expect(broadcast).not.toHaveBeenCalled();
	});

	test('getUserStatus should return error object when response status is 503 and content-type is application/json', async () => {
		const mockResponse = {
			ok: false,
			status: 503,
			headers: {
				get: jest.fn().mockReturnValue('application/json'),
			},
			json: jest.fn().mockResolvedValue({message: 'Service Unavailable'}),
		};
		global.fetch = jest.fn().mockResolvedValue(mockResponse);

		const userStatus = await getUserStatus();

		expect(fetch).toHaveBeenCalledWith('/syndication/user-status', {
			credentials: 'include',
		});
		expect(mockResponse.json).toHaveBeenCalled();
		expect(userStatus).toEqual({
			message: 'Service Unavailable',
			migrated: true,
			MAINTENANCE_MODE: true,
		});
		expect(broadcast).not.toHaveBeenCalled();
	});
	test('getUserStatus should throw an error when response status is not 401 or 503', async () => {
		const mockResponse = {
			ok: false,
			status: 404,
			text: jest.fn().mockResolvedValue('Not Found'),
		};
		global.fetch = jest.fn().mockResolvedValue(mockResponse);

		try {
			await getUserStatus();
		} catch (e) {
			expect(fetch).toHaveBeenCalledWith('/syndication/user-status', {
				credentials: 'include',
			});
			expect(mockResponse.text).toHaveBeenCalled();
			expect(broadcast).toHaveBeenCalled();
		}
	});

});
