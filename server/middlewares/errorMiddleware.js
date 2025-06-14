
const notFound = (req, res, next) => {
    const error = new Error(`"Sorry, can't find that!" - ${req.originalUrl}`)
    res.status(404)
    next(error);
}

const errorHandler = (error, req, res, next) => {
    if(res.headerSent) {
        return next(error);
    }

    res.status(error.code || 500).json({message: error.message || "Unknown Error Occured"});
}

module.exports = {notFound, errorHandler}