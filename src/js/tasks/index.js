import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
const TaskTable = lazy(() => import('./table'));
import { __ } from '@js/utils';


export default function TaskManager({ config = {} }) {
	return (
		<Suspense fallback={<div className="xpo_text-center xpo_p-4">{__('Loading...')}</div>}>
			<Toaster />
			<TaskTable config={config} />
		</Suspense>
	);
}