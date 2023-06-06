export const handleError = (response, message) => {
    response.status(400).send({
        errors: {
            msg: message,
            param: null,
            location: 'query'
        }
    });
};

export const executeQuery = async (query, params = []) => {
    try {
        const { rows } = await pool.query(query, params);
        return rows;
    } catch (error) {
        throw new Error(error);
    }
};