import * as testData from "../../tests/backend/test_data.ts";

let testdata = testData;

export const getTestData = () => {
	return testData;
};
// deno-lint-ignore no-explicit-any
export const setTestData = (data: any) => {
	testdata = data;
};
