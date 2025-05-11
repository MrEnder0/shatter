import { world, system, EntityComponentTypes } from "@minecraft/server";

const itemLastPositions = new Map();

// --- Configuration ---
// Minimum vertical speed (blocks per tick) for the breakable item to be considered for breaking.
// 0.45 blocks/tick is equivalent to 9 blocks/second.
// Items typically need to fall a couple of blocks to reach this speed.
const VERTICAL_SPEED_THRESHOLD_TO_BREAK = 0.45;
// Offset below the item's center (y-coordinate) to check for the ground block.
// Item entities are 0.25 blocks tall, so their center is 0.125 blocks above their base.
// Checking 0.2 blocks below the center ensures we're looking at the block they landed on.
const GROUND_CHECK_OFFSET = 0.2;

// List of item IDs that should be effected by this script.
const breakableItemTypeIds = [
    "minecraft:glass",
    "minecraft:glass_pane",
    "minecraft:ice",

    "minecraft:glass_bottle",
    "minecraft:egg",
    "minecraft:brown_egg",
    "minecraft:blue_egg",

    "minecraft:amethyst_block",
    "minecraft:amethyst_shard",
    "minecraft:sea_lantern",
    "minecraft:glowstone",

    "minecraft:red_stained_glass",
    "minecraft:orange_stained_glass",
    "minecraft:yellow_stained_glass",
    "minecraft:lime_stained_glass",
    "minecraft:green_stained_glass",
    "minecraft:blue_stained_glass",
    "minecraft:cyan_stained_glass",
    "minecraft:light_blue_stained_glass",
    "minecraft:purple_stained_glass",
    "minecraft:magenta_stained_glass",
    "minecraft:pink_stained_glass",
    "minecraft:white_stained_glass",
    "minecraft:gray_stained_glass",
    "minecraft:light_gray_stained_glass",
    "minecraft:black_stained_glass",
    "minecraft:brown_stained_glass",
    "minecraft:red_stained_glass_pane",
    "minecraft:orange_stained_glass_pane",
    "minecraft:yellow_stained_glass_pane",
    "minecraft:lime_stained_glass_pane",
    "minecraft:green_stained_glass_pane",
    "minecraft:blue_stained_glass_pane",
    "minecraft:cyan_stained_glass_pane",
    "minecraft:light_blue_stained_glass_pane",
    "minecraft:purple_stained_glass_pane",
    "minecraft:magenta_stained_glass_pane",
    "minecraft:pink_stained_glass_pane",
    "minecraft:white_stained_glass_pane",
    "minecraft:gray_stained_glass_pane",
    "minecraft:light_gray_stained_glass_pane",
    "minecraft:black_stained_glass_pane",
    "minecraft:brown_stained_glass_pane",
    "minecraft:tinted_glass",
];
// --- End Configuration ---

system.runInterval(() => {
    const itemsInOverworld = world.getDimension("overworld").getEntities({
        type: "minecraft:item"
    });

    for (const entity of itemsInOverworld) {
        try {
            const itemComponent = entity.getComponent(EntityComponentTypes.Item);
            if (!itemComponent || !itemComponent.itemStack) {
                itemLastPositions.delete(entity.id);
                continue;
            }

            const itemStack = itemComponent.itemStack;

            if (!breakableItemTypeIds.includes(itemStack.typeId)) {
                if (itemLastPositions.has(entity.id)) {
                    itemLastPositions.delete(entity.id);
                }
                continue;
            }

            const entityId = entity.id;
            const currentY = entity.location.y;
            const lastY = itemLastPositions.get(entityId);

            if (lastY !== undefined) {
                const deltaY = lastY - currentY;

                if (deltaY > VERTICAL_SPEED_THRESHOLD_TO_BREAK) {
                    const blockLocationBelow = {
                        x: Math.floor(entity.location.x),
                        y: Math.floor(currentY - GROUND_CHECK_OFFSET),
                        z: Math.floor(entity.location.z)
                    };

                    const blockBelow = entity.dimension.getBlock(blockLocationBelow);

                    if (blockBelow && !blockBelow.isAir && !blockBelow.isLiquid) {
                        entity.dimension.playSound("random.glass", entity.location, { volume: 0.8, pitch: 1.0 });
                        entity.dimension.spawnParticle("minecraft:basic_smoke_particle", entity.location);
                        itemLastPositions.delete(entityId);
                        entity.kill();

                        continue;
                    }
                }
            }

            itemLastPositions.set(entityId, currentY);

        } catch (error) {
            console.warn(`[Shatter] Error processing entity ${entity.id} (${entity.typeId}): ${error}`);
            if (error instanceof Error && error.stack) {
                console.warn(error.stack);
            }
            itemLastPositions.delete(entity.id); // Defensive removal
        }
    }
}, 1);

system.runInterval(() => {
    // world.sendMessage("[Shatter] Performing cleanup of itemLastPositions map."); // Debug message
    itemLastPositions.clear();
}, 5 * 60 * 20); // 5 minutes * 60 seconds/minute * 20 ticks/second = 6000 ticks.
