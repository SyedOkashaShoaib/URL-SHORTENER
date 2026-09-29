export function validateUrl(requestData, protocolSet) {
    if (typeof (requestData) !== String) {
        return { isValid: false, errorMessage: "The URL must be a string" };
    } //if not for this check, '{\"url\":[\"https://example.com\"]}' would be accepted as well, because js can convert this into a string implicitly.
    let url = null;
    try {
        url = new URL(requestData);
        console.log(url);
        console.log(url.protocol);
    }
    catch (error) {
        console.error(error);
        return { isValid: false, errorMessage: "The URL is syntactically invalid" };
    }
    if (protocolSet.has(url.protocol) === false) {
        return { isValid: false, errorMessage: "The URL protocol is not supported by the server" };
    }
    else {
        return { isValid: true, errorMessage: '' };
    }

}
//list of acceptable protocls; where do you save them?
// -> server starts -> read the file, make and store the set, send the set to validate Url everytime. Does this make sesne?