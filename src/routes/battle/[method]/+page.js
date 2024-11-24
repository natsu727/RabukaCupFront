export async function load({ params }) {
	const method = params.method;

	console.log("method: ", method);

	return {
		method  
	};
}

