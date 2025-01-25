const toFormatted = (date: Date) => {
	//format date
	const now = new Date();
	const diff = now.getTime() - date.getTime();

	const diffMinutes = Math.floor(diff / (1000 * 60));
	const diffHours = Math.floor(diff / (1000 * 60 * 60));
	const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

	if (diffMinutes < 60) {
		return `${diffMinutes} minutes ago`;
	} else if (diffHours < 24) {
		return `${diffHours} hours ago`;
	} else if (diffDays === 0) {
		return 'Today';
	} else if (diffDays === 1) {
		return 'Yesterday';
	} else {
		return `${diffDays} days ago`;
	}
};

export { toFormatted };
