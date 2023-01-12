<template>
    <div v-if="pageAmount > 0" class="pagination">
        <div class="page previous" :class="getBlockedAttribute('previous')" @click="setCurrentPage(this.currentPage - 1)">
            <div class="button previous">
                <Icon icon="before" size="24px" />
            </div>
        </div>

        <div class="page" :class="getCurrentAttribute(page)" v-for="page of getValidPages()" @click="setCurrentPage(page)">
            <div v-if="typeof page === 'number'" class="button">{{ page }}</div>
            <div v-else-if="page === 'backward'" class="button backward">
                <Icon icon="more" size="24px" />
            </div>
            <div v-else-if="page === 'forward'" class="button forward">
                <Icon icon="more" size="24px" />
            </div>
        </div>

        <div class="page next" :class="getBlockedAttribute('next')" @click="setCurrentPage(this.currentPage + 1)">
            <div class="button next">
                <Icon icon="next" size="24px" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Icon from '@/components/Misc/Icon.vue'

export default {
    name: 'ContentMatchHistoryPagination',
    components: { Icon },

    props: {
        currentPage: Number as () => number,
        pageAmount: Number as () => number
    },
    methods: {
        setCurrentPage(page) {
            if (typeof page !== 'number') return

            if (page >= 1 && this.pageAmount >= page) this.$emit('update:current-page', page)
        },
        getValidPages() {
            const validPages = [] as any[]

            for (let i = 0; i < this.pageAmount; i++) {
                const page = i + 1

                const isInRange = page >= this.currentPage - 3 || page >= this.pageAmount - 7
                const isNotFull = validPages.length < 8
                const isFirstOrLast = page === 1 || page === this.pageAmount

                if ((isInRange && isNotFull && !isFirstOrLast) || isFirstOrLast) {
                    validPages.push(page)
                }
            }

            if (validPages.length >= 9) {
                if (validPages[0] + 1 !== validPages[1]) validPages[1] = 'backward'
                if (validPages[8] - 1 !== validPages[7]) validPages[7] = 'forward'
            }

            return validPages
        },
        getCurrentAttribute(pageNumber) {
            return this.currentPage === pageNumber ? 'current' : null
        },
        getBlockedAttribute(position) {
            if (position === 'previous') return this.currentPage === 1 ? 'blocked' : null
            if (position === 'next') return this.currentPage === this.pageAmount ? 'blocked' : null
        }
    }
}
</script>

<style scoped>
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;

    height: 32px;
    width: fit-content;
    user-select: none;

    background-color: #202225;
    border: 0 solid;
    border-radius: 6px;
}
.pagination > .page {
    display: flex;
    align-items: center;
    justify-content: center;

    cursor: pointer;

    width: 32px;
    height: 32px;
}
.pagination > .page.blocked {
    cursor: no-drop;
}
.pagination > .page.current {
    cursor: default;
}
.pagination > .page.previous,
.pagination > .page.next {
    width: 64px;
}

/* transformation */
.pagination > .page {
    transform: scale(1);
    transition: transform ease-in-out 0.05s, background-color ease-in-out 0.05s;

    border: 0 solid;
    border-radius: 6px;
}
.pagination > .page:not(.blocked, .current):hover {
    background-color: #121314;

    transform: scale(1.12);
}
/* transformation */

.pagination > .page.current > .button {
    background-color: #18191c;
    border: 0 solid;
    border-radius: 6px;
}

.pagination > .page > .button {
    font-size: 14px;
    line-height: 16px;
    height: 16px;
    width: 26px;

    padding: 5px 0;
}

.pagination > .page > .button.previous,
.pagination > .page > .button.next,
.pagination > .page > .button.backward,
.pagination > .page > .button.forward {
    height: 24px;
    width: 24px;
    padding: 0;
}
</style>
