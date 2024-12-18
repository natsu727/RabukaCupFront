// const fs = import "fs";
// const content = fs.readFileSync("../bf_zig/zig-out/bin/bf_zig.wasm");



function removeNewlines(str: string) {
	return str.replace(/[\r\n]/g, '');
}
function removeWhitespace(str: string) {
	return str.replace(/\s+/g, '');
}

// var content = undefined;
// export async function loadWasm() {
// 	try {
// 		const response = await fetch(path);
// 		if (!response.ok) throw new Error('Failed to load the file');
// 
// 		binaryData = await response.arrayBuffer();
// 		content =  Uint8Array(binaryData);
// 	} catch (error) {
// 		console.error('Error loading binary file:', error);
// 	}
// }

const path = "src/lib/bf_zig/zig-out/bin/bf_zig.wasm";

//var instance;
export async function bfInterpret(bf_input: string) {
	bf_input = removeWhitespace(removeNewlines(bf_input));
	console.log(`bf: ${bf_input}`);
	try {
		const response = await fetch(path);
		const binaryData = await response.arrayBuffer();
		const content = new Uint8Array(binaryData);

		const module = await WebAssembly.compile(content);
		const out_buf: any[] = [];

	//	if (instance == undefined) {
			const instance = new WebAssembly.Instance(module, {
				env: {
					print: (x: any) => console.log(x),
					printChar: (x: number) => process.stdout.write(String.fromCharCode(x)),
					printToOut: (x: any) => out_buf.push(x),
				},
			});
	//	} 

		const lib = instance.exports;
		const memory = lib.memory as WebAssembly.Memory;
		const memoryView = new Uint8Array(memory.buffer);

		const { written } = new TextEncoder().encodeInto(bf_input, memoryView);

		(lib.bfInterpret as Function)(0, written);

		const ret = String.fromCharCode(...new Uint8Array(out_buf));

		return ret;
	} catch (e) {
		console.error(e);
		return null;
	}
}

var input = 
`+++++++++[>++++++++>+++++++++++>+++>+<<<<-]>
	.
	>++
	.
	+++++++
	.
	.
	+++
	.
	>+++++
	.
	<<+++++++++++++++
	.
	>
	.
	+++
	.
	------
	.
	--------
	.
	>+
	.
	>+
	.`;

// bfInterpret(input).then((out) => {
// 	console.log(`input : ${input}`);
// 	console.log(`output: ${out}`);
// });
