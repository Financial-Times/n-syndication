import { init } from './src/js/index';
import * as CONFIG from './src/js/config';
import { init as initRepublishing } from './src/js/republishing';
import { getUserData } from './src/js/data-store';
import {checkIfUserIsSyndicationCustomer} from './src/js/userAccess';

export {
	CONFIG,
	init,
	initRepublishing,
	checkIfUserIsSyndicationCustomer,
	getUserData
};
