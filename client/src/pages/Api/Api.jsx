import React from 'react';
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

const Api = () => {
    return (
        <SwaggerUI url="http://localhost:5000/api/" />
    );
}

export default Api;