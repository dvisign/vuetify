<template>
  <v-card
    class="mx-auto"
    width="256"
  >
    <v-navigation-drawer
      class="accent-4"
      app
      clipped
      hide-overlay
      height="100%"
    >
      <v-list>
        <div
          v-for="(item, i) in naviItems"
          :key="i"
        >
          <v-list-item 
            v-if="!item.nextNav"
            :to="item.path"
          >
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-group
            v-else
            :key="item.title"
            no-action
            :value="true"
          >
            <template v-slot:activator>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </template>
            <v-list-item
              v-for="sublinks in item.nextNav"
              :to="sublinks.path"
              :key="sublinks.title"
            >
              <v-list-item-title>{{ sublinks.title }}</v-list-item-title>
            </v-list-item>
          </v-list-group>
        </div>
      </v-list>
    </v-navigation-drawer>
  </v-card>
</template>

<script>
  import contextRoot from '../../../config/contextRoot';
  export default {
    data() {
      return {
        naviItems : [
          {
            title : '기본정보',
            active : false,
            auth : 100,
            nextNav : [
              {
                title : '검색',
                path : `${contextRoot}/main`,
                auth : 100,
              },
              {
                title : '검색1',
                path : `${contextRoot}/main/2`,
                auth : 100,
              },
              {
                title : '검색2',
                path : `${contextRoot}/main/3`,
                auth : 100,
              }
            ]
          },
          {
            title : '캐릭터',
            path : `${contextRoot}/characters`,
            active : false,
            auth : 102
          },
          {
            title : '플레이정보',
            path : `${contextRoot}/playInfo`,
            active : false,
            auth : 101
          },
          {
            title : '아이템배포',
            path : `${contextRoot}/item`,
            active : false,
            auth : 103
          },
          {
            title : '결제관리',
            path : `${contextRoot}/payment`,
            active : false,
            auth : 101
          },
          {
            title : '공지관리',
            path : `${contextRoot}/board/notice/1`,
            active : false,
            auth : 100
          },
          {
            title : '점검관리',
            path : `${contextRoot}/inspection`,
            active : false,
            auth : 100
          },
          {
            title : '통계',
            path : `${contextRoot}/statistics`,
            active : false,
            auth : 100
          },
          {
            title : '권한관리',
            path : `${contextRoot}/userAuthority`,
            active : false,
            auth : 103
          }
        ]
      }
    },
    methods: {
      sideNavBtnEvent : (val) => {
        console.log(val);
      }
    }
  };
</script>

<style></style>
