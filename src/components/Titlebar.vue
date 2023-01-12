<template>
    <div class="titlebar">
        <div class="button minimize" @click="minimize()">
            <svg aria-hidden="false" width="12" height="12" viewBox="0 0 12 12">
                <rect fill="currentColor" width="10" height="1" x="1" y="6"></rect>
            </svg>
        </div>
        <div class="button maximize" @click="maximize()">
            <svg aria-hidden="false" width="12" height="12" viewBox="0 0 12 12">
                <rect width="9" height="9" x="1.5" y="1.5" fill="none" stroke="currentColor"></rect>
            </svg>
        </div>
        <div class="button close" @click="close()">
            <svg aria-hidden="false" width="12" height="12" viewBox="0 0 12 12">
                <polygon
                    fill="currentColor"
                    fill-rule="evenodd"
                    points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"
                ></polygon>
            </svg>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Titlebar',
    data() {
        return {}
    },
    methods: {
        minimize: window.electron.minimize,
        maximize: window.electron.maximize,
        close: window.electron.close
    }
}
</script>

<style scoped>
.titlebar {
    position: fixed;
    top: 22px;

    background: #202225;

    margin-top: -22px;
    width: 100%;
    height: 22px;

    -webkit-user-select: none;
    -webkit-app-region: drag;

    display: flex;
    justify-content: flex-end;
    align-items: center;

    z-index: -0;
}
.titlebar .button {
    display: flex;
    align-content: center;

    -webkit-app-region: no-drag;
    color: #b9bbbe;
    align-items: center;
    padding: 5px 8px;
    cursor: pointer;
}
.titlebar .button.update {
    padding: 0 8px;
    margin: 3px;
    font-size: 12px;
    line-height: 16px;

    background-color: #2d7d46;
    border: 0 solid;
    border-radius: 100px;
}
.titlebar .button.close:hover {
    background-color: #ed4245;
    color: #ffffff;
}
.titlebar .button.maximize:hover,
.titlebar .button.minimize:hover {
    background-color: hsl(217deg 8% 34% / 40%);
    color: rgb(220 221 222);
}
.titlebar .button.maximize:active,
.titlebar .button.minimize:active {
    background-color: hsl(217deg 8% 34% / 60%);
    color: rgb(255 255 255);
}
</style>
