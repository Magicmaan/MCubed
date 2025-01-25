import Icon from '../../assets/icons/solid/.all';
import { useAppErrorsSelector } from '../../hooks/useRedux';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { LoremIpsum, loremIpsum } from 'react-lorem-ipsum';
import type { Error } from '../../redux/reducers/appReducer';

const ErrorAlert: React.FC<{
	error?: string;
	info?: string;
	advice?: string;
}> = ({ error: errorIN, info: infoIN, advice: adviceIN }) => {
	const errorEntry = useAppErrorsSelector();
	if (!errorEntry) return null;
	if (!errorEntry.length) return null;
	const { type, error, info, advice } = errorEntry[errorEntry.length - 1];

	return (
		<AlertDialog>
			<AlertDialogTrigger
				asChild
				className="m-0 h-full w-64 justify-start rounded-lg p-1 pl-2 pr-10"
			>
				<Button
					variant="destructive"
					className="m-0 my-1 justify-start"
				>
					<div className="flex aspect-video h-5 w-5 select-none items-center justify-center rounded-full border-2 border-white">
						!
					</div>
					<p className="flex h-full w-full items-center overflow-hidden text-ellipsis whitespace-nowrap text-start text-xs text-white">
						Error: {error}
					</p>
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="dark">
				<AlertDialogHeader>
					<AlertDialogTitle>
						Error {type}: {error}
					</AlertDialogTitle>
					<AlertDialogDescription>{info}</AlertDialogDescription>
					<AlertDialogDescription>{advice}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction>Continue</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default ErrorAlert;
