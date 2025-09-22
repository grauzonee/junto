import fs from 'fs/promises';
import { existsSync } from 'fs';
import { getConfigValue } from '@/helpers/configHelper';

export const deleteImage = async (imagePath: string) => {
    await fs.unlink(imagePath);
}

export const checkImage = (imagePath: string): boolean => {
    return existsSync(imagePath);
}

export const sanitizeImageUrl = (imageUrl: string): string => {
    return imageUrl.replace(getConfigValue('HOST') + '/', '');
}
