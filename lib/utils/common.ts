

function f() {

}

var CommonUtils = {

    getRootPath : function(path) {
        if (path !== null && path !== "") {
            let index = path.indexOf(Constants.DIR_JCRROOT);
            return (
                path.substring(0, (index + 8))
            )
        }
        return "";
    }

};

export { CommonUtils };