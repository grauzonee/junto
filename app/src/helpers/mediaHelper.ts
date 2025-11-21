/**
 * Helper functions for media file management.
 * 
 * @packageDocumentation
 */

import fs from 'fs/promises';
import { existsSync } from 'fs';
import { getConfigValue } from '@/helpers/configHelper';

/**
 * Deletes an image file at the specified path.
 * @param {string} imagePath 
 */
export const deleteImage = async (imagePath: string) => {
    await fs.unlink(imagePath);
}

/**
 * Checks if an image file exists at the specified path.
 * @param {string} imagePath 
 * @returns {boolean}
 */
export const checkImage = (imagePath: string): boolean => {
    return existsSync(imagePath);
}

/**
 * Sanitizes an image URL by removing the host prefix.
 * @param {string} imageUrl 
 * @returns {string}
 */
export const sanitizeImageUrl = (imageUrl: string): string => {
    return imageUrl.replace(getConfigValue('HOST') + '/', '');
}
