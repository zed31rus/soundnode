import { PrismaClient } from "./generated/prisma/index.js";

export const prisma = PrismaClient()

export async function addFavourite(sound, client) {
    try {
        prisma.FavouriteSounds.create({
            data: {
                clientLogin: client.login,
                soundIndex: sound.index,
                
            }
        })
    } catch {

    }
}