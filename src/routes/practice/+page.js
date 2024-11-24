export async function load({ params }) {
    const passcode = params.passcode;
    console.log("passcode: ", passcode);
    return {
        passcode
    };
}
