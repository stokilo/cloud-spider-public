<template>
  <nav class="navbar fixed-top main-show-temporary">
    <div class="d-flex align-items-center navbar-left">
      <a
        href="#"
        class="menu-button d-none d-md-block"
        @click.prevent.stop="menuStore.changeSideMenuStatus()"
      >
        <svg class="main" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 17">
          <rect x="0.48" y="0.5" width="7" height="1" />
          <rect x="0.48" y="7.5" width="7" height="1" />
          <rect x="0.48" y="15.5" width="7" height="1" />
        </svg>
        <svg class="sub" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 17">
          <rect x="1.56" y="0.5" width="16" height="1" />
          <rect x="1.56" y="7.5" width="16" height="1" />
          <rect x="1.56" y="15.5" width="16" height="1" />
        </svg>
      </a>
      <a
        href="#"
        class="menu-button-mobile d-xs-block d-sm-block d-md-none"
        @click.prevent.stop="menuStore.changeSideMenuStatus()"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 17">
          <rect x="0.5" y="0.5" width="25" height="1" />
          <rect x="0.5" y="7.5" width="25" height="1" />
          <rect x="0.5" y="15.5" width="25" height="1" />
        </svg>
      </a>
    </div>

    <div class="navbar-right">
      <div class="user d-inline-block">
        <span class="mr-1">WHAT SHOULD BE HERE?</span>
        <span class="">
          <img alt="Profile image" :src="userProfileStore.profileImgUrl">
        </span>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { proxy } from '~/store/store'
import { MenuStore } from '~/store/modules/common/menu-store'

@Component
export default class Topnav extends Vue {
  menuStore: MenuStore = proxy.menuStore
}
</script>
