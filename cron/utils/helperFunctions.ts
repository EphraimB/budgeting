import { type Response } from "express";
import pool from "../config/db.js";

/**
 *
 * @param response - Response object
 * @param message - Error message
 * Sends a response with an error message
 */
export const handleError = (response: Response, message: string): void => {
  response.status(500).send(message);
};

/**
 *
 * @param query - SQL query
 * @param params - Query parameters
 * @returns - Query result
 */
export const executeQuery = async <T = any>(
  query: string,
  params: any[] = []
): Promise<T[]> => {
  try {
    const { rows } = await pool.query(query, params);
    return rows;
  } catch (error) {
    throw new Error(error);
  }
};
