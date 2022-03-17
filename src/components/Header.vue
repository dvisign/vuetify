<template>
    <v-app-bar app
    dark
    tabs
    flat
    clipped-left
    width="100%"
    color="#3f51b5"
    >
        <v-toolbar-title>inside</v-toolbar-title>
        <v-spacer></v-spacer>
        <template v-slot:extension>
            <v-tabs align-with-title v-model="activeTab">
            <v-tab v-for="item of items" :key="item.title" @click="selectMenu(item)" v-if="item.id != 'auth'">{{ item.title }}</v-tab>
            <v-tab v-for="item of items" :key="item.title" @click="selectMenu(item)" v-if="item.id == 'auth' && authChk">{{ item.title }}</v-tab>
            <v-tabs-slider color="pink"></v-tabs-slider>
            </v-tabs>
        </template>
    </v-app-bar>
</template>

<script>
export default {
    data () {
      return {
        drawer: false,
        clipped: false,
        authChk: false,
        activeTab: '',
        items: [
            {
                idx: 0,
                title: '결제',
                id: 'payment',
                main: 'Payment'
            },
            {
                idx: 1,
                title: '블록체인',
                id: 'blockchain',
                main: 'SmartContract'
            },
            {
                idx: 2,
                title: '관리자',
                id: 'auth',
                main: 'Join'
            }
        ]
      }
    },
    methods: {
        selectMenu: function(menu) {
            if (this.$route.name == menu.main) {
                //pass
            } else {
                localStorage.setItem('lastTab', menu.idx);
                this.$emit('change-menu', menu.id);
                this.$router.push({ name: menu.main });
            }
        }
    },
    created () {
    	// 매니저일떄만 관리자 관리 필요.
    	this.authChk = this.$router.app.$children[0].authChk;
    },
    mounted () {
        const tabIdx = Number(localStorage.getItem('lastTab'));
        this.activeTab = tabIdx;
        this.$emit('change-menu', this.items[tabIdx].id);
    }
}
</script>


<style>

</style>