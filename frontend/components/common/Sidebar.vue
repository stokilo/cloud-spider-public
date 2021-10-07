<template>
  <div class="sidebar" @click.stop="()=>{}">
    <div class="main-menu">
      <perfect-scrollbar
        class="scroll"
        :settings="{ suppressScrollX: true, wheelPropagation: false }"
      >
        <ul class="list-unstyled">
          <li
            v-for="(item,index) in menuStore.menuItems"
            :key="`parent_${index}`"
            :class="{ 'active' : (menuStore.selectedParentMenu === item.id && menuStore.viewingParentMenu === '') || menuStore.viewingParentMenu === item.id }"
            :data-flag="item.id"
          >
            <a
              v-if="item.newWindow"
              :href="item.to"
              rel="noopener noreferrer"
              target="_blank"
              @click.native="menuStore.onAnyItemClick()"
            >
              <b-icon :icon="item.icon" font-scale="3.0" variant="primary" class="p-1" />
              {{ $t(item.label) }}
            </a>
            <a
              v-else-if="item.subs && item.subs.length>0"
              :href="`#${item.to}`"
              @click.prevent="menuStore.openSubMenu(item)"
            >
              <b-icon :icon="item.icon" font-scale="3.0" variant="primary" class="p-1" />
              {{ $t(item.label) }}
            </a>
            <router-link
              v-else
              :to="item.to"
              @click.native="menuStore.onAnyItemClick()"
            >
              <b-icon :icon="item.icon" font-scale="3.0" variant="primary" class="p-1" />
              {{ $t(item.label) }}
            </router-link>
          </li>
        </ul>
      </perfect-scrollbar>
    </div>

    <div class="sub-menu">
      <perfect-scrollbar
        class="scroll"
        :settings="{ suppressScrollX: true, wheelPropagation: false }"
      >
        <ul
          v-for="(item,itemIndex) in menuStore.menuItems"
          :key="`sub_${item.id}`"
          :class="{'list-unstyled':true, 'd-block' : (menuStore.selectedParentMenu === item.id && menuStore.viewingParentMenu === '') || menuStore.viewingParentMenu === item.id }"
          :data-parent="item.id"
        >
          <li
            v-for="(sub,subIndex) in item.subs"
            :key="`sub_${subIndex}`"
            :class="{'has-sub-item' : sub.subs && sub.subs.length > 0 , 'active' : $route.path.indexOf(sub.to)>-1}"
          >
            <a v-if="sub.newWindow" :href="sub.to" rel="noopener noreferrer" target="_blank">
              <b-icon :icon="sub.icon" variant="primary" class="p-1" />
              <span>{{ $t(sub.label) }}</span>
            </a>
            <template v-else-if="sub.subs && sub.subs.length > 0">
              <b-link
                v-b-toggle="`menu_${itemIndex}_${subIndex}`"
                variant="link"
                class="rotate-arrow-icon opacity-50"
              >
                <span class="d-inline-block">{{ $t(sub.label) }}</span>
              </b-link>
              <b-collapse :id="`menu_${itemIndex}_${subIndex}`" visible>
                <ul class="list-unstyled third-level-menu">
                  <li
                    v-for="(thirdLevelSub, thirdIndex) in sub.subs"
                    :key="`third_${itemIndex}_${subIndex}_${thirdIndex}`"
                    :class="{'third-level-menu':true , 'active' : $route.path ===thirdLevelSub.to}"
                  >
                    <a
                      v-if="thirdLevelSub.newWindow"
                      :href="thirdLevelSub.to"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <b-icon :icon="thirdLevelSub.icon" font-scale="1.0" variant="primary" class="p-1" />
                      <span>{{ $t(thirdLevelSub.label) }}</span>
                    </a>
                    <router-link v-else :to="thirdLevelSub.to" @click.native="menuStore.onAnyItemClick()">
                      <b-icon :icon="thirdLevelSub.icon" font-scale="1.0" variant="primary" class="p-1" />
                      <span>{{ $t(thirdLevelSub.label) }}</span>
                    </router-link>
                  </li>
                </ul>
              </b-collapse>
            </template>
            <router-link v-else :to="sub.to" @click.native="menuStore.onAnyItemClick()">
              <b-icon :icon="sub.icon" font-scale="2.0" variant="primary" class="p-1" />
              <span>{{ $t(sub.label) }}</span>
            </router-link>
          </li>
        </ul>
      </perfect-scrollbar>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { proxy } from '~/store/store'
import { MenuStore } from '~/store/modules/common/menu-store'

@Component
export default class Sidebar extends Vue {
  menuStore: MenuStore = proxy.menuStore

  mounted () {
    this.menuStore.mounted()
  }

  beforeDestroy () {
    this.menuStore.beforeDestroy()
  }
}

</script>
