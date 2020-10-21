import {products as getUserProducts} from 'next-session-client';
import { SYNDICATION_ACCESS } from './config';
export async function checkIfUserIsSyndicationCustomer () {

	const response = await getUserProducts().catch(err => err);

	return response && response.products
		? response.products.includes(SYNDICATION_ACCESS.STANDARD)
		: false;
}
export async function getSyndicationAccess () {

	const response = await getUserProducts().catch(err => err);

	if(response && response.products) {
		return response.products.split(',').filter(product => (
			product === SYNDICATION_ACCESS.STANDARD ||product=== SYNDICATION_ACCESS.RICH_ARTICLE));
	}

	return [];
}
