<template>
    <div class="free-toasting-service">
        <transition-group>
            <div v-for="toast in toasts" class="toast" :class="`type-${toast.type}`" :key="toast.uuid">
                <div class="background"></div>
                <div class="icon">
                    <Icon :icon="toast.icon as any" size="24px" />
                </div>
                <div class="detail">
                    <div class="title">{{ toast.title }}</div>
                    <div v-if="toast.button" class="button">{{ toast.button }}</div>
                </div>
            </div>
        </transition-group>
    </div>
</template>

<script lang="ts">
import Icon from '@/components/Misc/Icon.vue'
import * as crypto from 'crypto'

const ErrorChannel = new BroadcastChannel('error')

export default {
    name: 'FreeToastingService',
    components: { Icon },
    props: {},
    data() {
        return {
            toasts: {} as { [uuid: string]: { uuid: string; type: string; icon: string; title: string; button: string; link: string } }
        }
    },
    mounted() {
        ErrorChannel.addEventListener('message', ({ data }) => {
            const { type, icon, title, button, link, time } = data as { type: string; icon: string; title: string; button: string; link: string; time: number }
            const uuid = window.crypto.randomUUID()

            this.toasts[uuid] = { uuid, type, icon, title, button, link }

            setTimeout(() => delete this.toasts[uuid], time)
        })
    },
    presets: {
        UNEXPECTED_ERROR: {
            type: 'error',
            icon: 'report',
            title: 'An unexpected error occurred.',
            button: 'REPORT INCIDENT',
            link: null,
            time: 30_000
        },
        LOGIN_EXPIRED_TRY_RE_ADD: {
            type: 'warning',
            icon: 'key_off',
            title: 'Login expired. Try re-adding your account with "stay signed-in" enabled.',
            button: null,
            link: null,
            time: 9_000
        },
        FAILED_ASSET_LOAD: {
            type: 'warning',
            icon: 'warning',
            title: "Couldn't download assets, retrying in 1 second..",
            button: null,
            link: null,
            time: 3_000
        }
    }
}
</script>

<style scoped>
.toast.v-enter-from {
    top: 200px;
    opacity: 0;
}
.toast.v-leave-to {
    top: -200px;
    margin-bottom: -34px;
}

.type-error {
    --scheme-text: #ffffff;
    --scheme-100: #d92626;
    --scheme-90: #c32222;
    --scheme-80: #ae1e1e;
}
.type-warning {
    --scheme-text: #121314;
    --scheme-100: #faa81a;
    --scheme-90: #e19717;
    --scheme-80: #c88615;
}

.free-toasting-service {
    z-index: 900;

    position: absolute;
    right: 22px;
    top: 44px;

    display: flex;
    flex-direction: column;
    align-items: flex-end;

    overflow: hidden;
    padding: 44px 22px 22px 22px;
    margin: -44px -22px -22px -22px;
    height: 654px;

    pointer-events: none;
}
.toast {
    position: relative;
    top: 0;

    width: fit-content;
    min-height: 34px;
    margin-bottom: 11px;

    background-color: var(--scheme-100);
    border-radius: 6px;
    box-shadow: #121314 0 8px 32px -4px;
    color: var(--scheme-text);

    transition: top 0.45s ease-in-out, margin 0.45s ease-in-out, opacity 0.25s ease-in-out;
    pointer-events: all;
}
.toast > .icon {
    position: absolute;
    left: 5px;
    top: 5px;
}

.toast > .detail {
    display: flex;
}
.toast > .detail > .title {
    text-align: left;
    line-height: 18px;
    margin: 8px 8px 8px 34px;
    font-size: 14px;
}

.toast > .detail > .button {
    line-height: 18px;
    padding: 4px 8px;
    margin: 4px;
    font-size: 14px;

    background-color: var(--scheme-90);
    border-radius: 4px;

    outline: 1px solid var(--scheme-80);
    outline-offset: -1px;

    cursor: pointer;
}
</style>
