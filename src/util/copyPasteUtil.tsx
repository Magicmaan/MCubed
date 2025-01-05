export function getClipboardData(): Promise<string> {
	const clipboardData = navigator.clipboard.readText();
	return clipboardData;
}
export function copyToClipboard(data: string): Promise<void> {
	const clipboardData = navigator.clipboard.writeText(data);
	return clipboardData;
}

export function getClipboardDataAsVector(
	fallback: [number, number, number] = [0, 0, 0]
): Promise<[number, number, number]> {
	console.log('hi');
	return getClipboardData().then((data) => {
		const parts = data.split(' ');
		if (parts.length !== 3) {
			throw new TypeError(
				'Warning: Invalid vector length: Expected 3 but got ' +
					parts.length +
					'\n Data: ' +
					data
			);
		}

		const vec = parts.map((part, index) => {
			if (isNaN(Number(part))) {
				throw new TypeError(
					'Warning: Invalid vector value at position ' +
						index +
						' : Expected number but got "' +
						part +
						'"'
				);
			}
			return parseFloat(part);
		});

		return [
			vec[0] ?? fallback[0],
			vec[1] ?? fallback[1],
			vec[2] ?? fallback[2],
		];
	});
}
