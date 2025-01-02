export function toTrunPercentage(value: number, d: number = 2): string {
	if (isNaN(value)) {
		throw new Error("Input must be a number");
	}
	const percentage = value.toFixed(d);
	return percentage + "%";
}

export function toTrun(value: number, d: number = 2): number {
	if (isNaN(value)) {
		throw new Error("Input must be a number");
	}
	const val = Number(value.toFixed(d)).valueOf();
	return val;
}

export function getDistance(vector1: { x: 0; y: 0 }, vector2: { x: 0; y: 0 }) {
	// Calculate the difference in x and y coordinates
	const dx = vector2.x - vector1.x;
	const dy = vector2.y - vector1.y;
	// Calculate the distance using the Euclidean distance formula
	return Math.sqrt(dx * dx + dy * dy);
}

export function round(number: number, increment: number, offset: number) {
	return Math.ceil((number - offset) / increment) * increment + offset;
}
