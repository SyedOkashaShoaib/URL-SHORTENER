export function validateUrl(requestData, protocolSet) {
    try {
        const url = new URL(requestData);
    }
    catch(error) {
        console.error(error);
        return false, "The URL is syntactically invalid";
    }
    
}

validateUrl('shitt');
//list of acceptable protocls; where do you save them? 
// -> server starts -> read the file, make and store the set, send the set to validate Url everytime. Does this make sesne?