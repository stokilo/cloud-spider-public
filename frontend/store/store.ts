import { extractVuexModule, createProxy } from 'vuex-class-component'
import Vuex from 'vuex'
import Vue from 'vue'
import { MenuStore } from '~/store/modules/common/menu-store'
import { AuthStore } from '~/store/modules/auth/auth-store'
import { SearchStore } from '~/store/modules/search-store'
import { ListingStore } from '~/store/modules/listing/listing-store'

Vue.use(Vuex)

export const store = new Vuex.Store({
  modules: {
    ...extractVuexModule(AuthStore),
    ...extractVuexModule(MenuStore),
    ...extractVuexModule(SearchStore),
    ...extractVuexModule(ListingStore)
  }
})

export const proxy = {
  authStore: createProxy(store, AuthStore),
  menuStore: createProxy(store, MenuStore),
  searchStore: createProxy(store, SearchStore),
  listingStore: createProxy(store, ListingStore)
}
