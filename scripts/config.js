import { world, system } from "@minecraft/server"
import { ModalFormData } from "@minecraft/server-ui"

const PLAYSOUND_DPI = "shatter:play_sound";
const PLAYPARTICLE_DPI = "shatter:play_particle";
const DPI_INIT = "shatter:world_init";

export var play_sound = false;
export var play_particle = false;

function initializeDefaultWorldData(player, attempts) {
    let ui_title = "Shatter Config";
    system.run(() => {
        let ui = new ModalFormData()
            .title(ui_title)
            .toggle("Enable Sounds", true)
            .toggle("Enable Particles", true);
        ui.show(player).then((result) => {


            if (result.formValues !== undefined) {
                const enableSounds = result.formValues[0];
                const enableParticles = result.formValues[1];

                const play_sound = world.getDynamicProperty(PLAYSOUND_DPI);
                if (play_sound === undefined) {
                    world.setDynamicProperty(PLAYSOUND_DPI, enableSounds);
                }

                const play_particle = world.getDynamicProperty(PLAYPARTICLE_DPI);
                if (play_particle === undefined) {
                    world.setDynamicProperty(PLAYPARTICLE_DPI, enableParticles);
                }

                play_sound = enableSounds;
                play_particle = enableParticles;

                world.setDynamicProperty(DPI_INIT, true);
                world.sendMessage("§a[Shatter] World data set successfully.");
            } else {
                console.warn(`[Shatter] No form values returned Attempts: ${attempts+1}`);
                if (attempts < 3) {
                    initializeDefaultWorldData(player, attempts + 1);
                } else {
                    world.sendMessage("§c[Shatter] Failed to set world data after multiple attempts.");
                }
            }
        });
    });
}

world.afterEvents.playerSpawn.subscribe(eventData => {
    try {
        const isInitialized = world.getDynamicProperty(DPI_INIT);

        if (isInitialized === undefined || !isInitialized) {
            world.sendMessage("§6[Shatter] Prompting Shatter config for the first time...");

            // Show the UI form to the player
            initializeDefaultWorldData(eventData.player, 0);
        } else {
            const play_sound_value = world.getDynamicProperty(PLAYSOUND_DPI);
            const play_particle_value = world.getDynamicProperty(PLAYPARTICLE_DPI);

            play_sound = play_sound_value;
            play_particle = play_particle_value;
        }
    } catch (error) {
        console.error(`[Shatter] Error initializing default world data: ${error}`);
        world.sendMessage("§c[Shatter] Failed to initialize default world data.");
    }
});