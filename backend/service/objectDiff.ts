// source: https://stackoverflow.com/a/61406094

// interface Update {
// 	oldValue: any;
// 	newValue: any;
// }

interface ObjectDiff {
	added?: Record<string | number | symbol, unknown> | ObjectDiff;
	updated?: {
		[propName: string]: unknown | ObjectDiff;
	};
	removed?: Record<string | number | symbol, unknown> | ObjectDiff;
	unchanged?: Record<string | number | symbol, unknown> | ObjectDiff;
}
interface ArrayDiff {
	added: unknown[];
	removed: unknown[];
}

export class ObjectUtils {
	/**
	 * @return if obj is an Object, including an Array.
	 */
	static isObject(obj: object): boolean {
		return obj !== null && typeof obj === "object";
	}

	/**
	 * @return if obj is an Object, including an Array.
	 */
	static arrayDiff(oldArray: unknown[], newArray: unknown[]): ArrayDiff | null {
		const diff: ArrayDiff = {
			added: [],
			removed: [],
		};
		const oldSet = new Set(oldArray);
		const newSet = new Set(newArray);
		// array entries which are in old but not in new array
		diff.removed = Array.from(oldSet.difference(newSet));
		// entries are in new but not in old array
		diff.added = Array.from(newSet.difference(oldSet));
		if (Array.from(newSet.symmetricDifference(oldSet)).length === 0) return null;
		return diff;
	}
	/**
	 * @param oldObj The previous Object or Array.
	 * @param newObj The new Object or Array.
	 * @param deep If the comparison must be performed deeper than 1st-level properties.
	 * @return A difference summary between the two objects.
	 */
	static diff(oldObj: object, newObj: object, deep = true): ObjectDiff | null {
		const out: ObjectDiff = {};
		const added: Record<string | number | symbol, unknown> = {};
		const updated: Record<string | number | symbol, unknown> = {};
		const removed: Record<string | number | symbol, unknown> = {};
		const unchanged: Record<string | number | symbol, unknown> = {};
		for (const oldProp in oldObj) {
			if (Object.hasOwn(oldObj, oldProp)) {
				const newPropValue = newObj[oldProp as keyof typeof oldObj];
				const oldPropValue = oldObj[oldProp as keyof typeof oldObj];
				if (Object.hasOwn(newObj, oldProp)) {
					if (newPropValue !== oldPropValue) {
						if (deep && this.isObject(oldPropValue) && this.isObject(newPropValue)) {
							const d = this.diff(oldPropValue, newPropValue, deep);
							if (d) updated[oldProp as keyof typeof oldObj] = d;
						} else if (
							(Array.isArray(newPropValue) && Array.isArray(oldPropValue)) &&
							!this.isObject(oldPropValue[0]) && !this.isObject(newPropValue[0])
						) {
							const arrayDiff = this.arrayDiff(oldPropValue, newPropValue);
							if (arrayDiff) {
								if (arrayDiff.added.length) {
									added[oldProp as keyof typeof oldObj] = arrayDiff.added;
								}
								if (arrayDiff.removed.length) {
									removed[oldProp as keyof typeof oldObj] = arrayDiff.removed;
								}
							}
						} else if (!(this.isObject(oldPropValue) && this.isObject(newPropValue))) {
							updated[oldProp as keyof typeof oldObj] = newPropValue;
						}
						// updated[oldProp as keyof typeof oldObj] =
						// 	deep && this.isObject(oldPropValue) && this.isObject(newPropValue)
						// 		? this.diff(oldPropValue, newPropValue, deep)
						// 		: newPropValue;
					}
				} else {
					removed[oldProp as keyof typeof oldObj] = oldPropValue;
				}
			}
		}
		for (const newProp in newObj) {
			if (Object.hasOwn(newObj, newProp)) {
				const oldPropValue = oldObj[newProp as keyof typeof newObj];
				const newPropValue = newObj[newProp as keyof typeof newObj];
				if (!Object.hasOwn(oldObj, newProp)) {
					if (!(Array.isArray(newPropValue) && Array.isArray(oldPropValue))) {
						added[newProp as keyof typeof newObj] = newPropValue;
						// const arrayDiff = this.arrayDiff(oldPropValue, newPropValue);
						// if (arrayDiff) {
						// 	if (arrayDiff.added) {
						// 		added[newProp as keyof typeof newObj] = arrayDiff.added;
						// 	}
						// 	removed[newProp as keyof typeof newObj] = arrayDiff.removed;
						// }
					}
					// else {
					// 	added[newProp as keyof typeof newObj] = newPropValue;
					// }
				}
				// if (Object.hasOwn(oldObj, newProp)) {
				// 	if (oldPropValue !== newPropValue) {
				// 		if (!deep || !this.isObject(oldPropValue)) {
				// 			// updated[newProp as keyof typeof newObj].oldValue = oldPropValue;
				// 		}
				// 	}
				// } else {
				// 	added[newProp as keyof typeof newObj] = newPropValue;
				// }
			}
		}
		// const out: ObjectDiff = {};
		if (Object.keys(added).length) out.added = added;
		if (Object.keys(updated).length) out.updated = updated;
		if (Object.keys(removed).length) out.removed = removed;
		if (Object.keys(unchanged).length) out.unchanged = unchanged;
		if (!Object.keys(out).length) return null;
		return out;
	}
}
