<template>
    <div class="buddy-mini" :class="{ selecting, fav: buddy.fav }" @click="openSelector" @mouseenter="enterBuddy" @mouseleave="leaveBuddy">
        <div v-if="buddy.entry.displayIcon" class="image" :style="`--bgi: url('${buddy.entry.displayIcon}')`">
            <div class="sharpen"></div>
        </div>
        <Icon v-if="buddy.fav" class="fav is" icon="star" size="16px" @click="deleteFavourite" />
        <Icon v-else-if="hover && buddy.fav !== null" class="fav" icon="star-outline" size="16px" @click="addFavourite" />
        <transition-group>
            <div v-if="!selecting" class="display-name">
                <div class="name">{{ buddy.entry.displayName.replace(/ Buddy$/, '') }}</div>
            </div>
            <div v-if="selecting" class="instance-selector" @mouseleave="leaveSelector" :class="{ 'single-instance': buddy.instances.length === 1 }">
                <div class="instance" v-for="instance of buddy.instances" @click="selectInstance(instance)">
                    <div
                        v-if="instance.usage"
                        class="image"
                        :style="`--bgi: url('https://media.valorant-api.com/weaponskinchromas/${instance.usage.ChromaID}/fullrender.png')`"
                    ></div>
                    <div v-else class="text">Unused Slot</div>
                </div>
            </div>
        </transition-group>
    </div>
</template>

<script lang="ts">
import Icon from '@/components/Misc/Icon.vue'

export default {
    name: 'LoadoutBuddyMini',
    components: { Icon },
    props: {
        buddy: Object as () => ProcessedLoadoutBuddy
    },
    data() {
        return {
            selecting: false,
            hover: false
        }
    },
    methods: {
        openSelector() {
            const Buddy = this.buddy.entry
            if (Buddy.uuid === 'unequip') {
                this.$emit('update:buddy', [undefined, undefined, undefined])
            } else {
                this.selecting = true
            }
        },
        leaveSelector() {
            this.selecting = false
        },
        enterBuddy() {
            this.hover = true
        },
        leaveBuddy() {
            this.hover = false
        },
        selectInstance(instance: ProcessedLoadoutBuddyInstance) {
            const Buddy = this.buddy.entry
            this.$emit('update:buddy', [Buddy.uuid, Buddy.levels[0].uuid, instance.id, instance.usage?.ID])
        },
        addFavourite(event: PointerEvent) {
            event.stopPropagation()
            const Buddy = this.buddy.entry
            this.$emit('addfav:buddy', Buddy.uuid)
        },
        deleteFavourite(event: PointerEvent) {
            event.stopPropagation()
            const Buddy = this.buddy.entry
            this.$emit('delfav:buddy', Buddy.uuid)
        }
    }
}
</script>

<style scoped>
.buddy-mini > :is(.display-name, .instance-selector):is(.v-enter-from, .v-leave-to) {
    opacity: 0;
}

.buddy-mini {
    position: relative;
    height: 70px;

    border-radius: 6px;
    background-color: #18191c;

    cursor: pointer;
}
.buddy-mini.selecting {
    pointer-events: none;
}
.buddy-mini * {
    pointer-events: none;
    user-select: none;
}

.buddy-mini.fav {
    --fav-color: #fbc02d99;

    outline: 1px solid var(--fav-color);
    outline-offset: -1px;
}
.buddy-mini.fav > .display-name > .name {
    outline: 1px solid var(--fav-color);
}

.buddy-mini > .instance-selector {
    overflow: var(--webkit-overlay);

    display: flex;
    flex-direction: column;

    position: absolute;
    left: 0;
    top: 0;

    width: 100%;
    height: 100%;
    border-radius: 6px;

    background-color: #18191c;

    pointer-events: all;
    transition: opacity 0.15s ease-in-out;
}
.buddy-mini > .instance-selector.single-instance {
    justify-content: center;
}
.buddy-mini > .instance-selector > .instance {
    width: 100%;
    min-height: 35px;

    background-color: #18191c;

    cursor: pointer;
    transition: filter 0.075s ease-in-out;
    pointer-events: all;
}
.buddy-mini > .instance-selector > .instance:hover {
    filter: brightness(1.25);
}
.buddy-mini > .instance-selector > .instance > .image {
    width: calc(100% - 10px);
    height: calc(100% - 10px);
    margin: 5px;

    background-position: center;
    background-repeat: no-repeat;
    background-image: var(--bgi);
    background-size: contain;
}
.buddy-mini > .instance-selector > .instance > .text {
    font-size: 13px;
    line-height: 9px;
    padding: 13px 0;

    color: #6d6f78;
}

.buddy-mini > .fav {
    position: absolute;
    right: 0;
    top: 0;

    width: 17px;
    height: 17px;
    padding: 3px;

    pointer-events: all;
}
.buddy-mini > .fav:not(.is) {
    color: #ffffff33;
}
.buddy-mini > .fav:is(.is) {
    color: var(--fav-color);
}
.buddy-mini > .fav:hover {
    opacity: 0.666;
}
.buddy-mini > .image {
    position: absolute;
    left: 11px;
    top: 11px;

    height: calc(100% - 22px);
    width: calc(100% - 22px);

    background-position: center;
    background-repeat: no-repeat;
    background-image: var(--bgi);
    background-size: contain;
}
.buddy-mini > .display-name {
    display: flex;
    justify-content: center;

    position: absolute;
    bottom: -4px;
    left: 3px;

    height: 13px;
    width: calc(100% - 6px);

    transition: opacity 0.15s ease-in-out;
}
.buddy-mini > .display-name > .name {
    height: 11px;
    padding: 1px 5px;
    border-radius: 6px;

    font-size: 9px;
    line-height: 13px;

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    background-color: #121314;
}

.sharpen {
    height: 100%;
    width: 100%;

    background-position: center;
    background-repeat: no-repeat;
    background-image: var(--bgi);
    background-size: contain;

    image-rendering: pixelated;
}

.buddy-mini > .instance-selector::-webkit-scrollbar {
    width: 0;
    height: 0;
}
</style>
