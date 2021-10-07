<template>
  <section class="section is-small">
    <h1 class="title">
     Cloud Spider
    </h1>
    <h2 class="subtitle">
      Find your dream <strong>home</strong>
    </h2>

    <b-image
      :src="require('@/assets/img/home.jpg')"
      alt="Cloud Spider find your home"
      ratio="601by235"
    ></b-image>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { proxy } from '~/store/store'
import { AuthStore } from '~/store/modules/auth/auth-store'
import { $loader, $token } from '~/utils/api'
import { NuxtJsRouteHelper } from '~/store/api/routes'

@Component({})
export default class AuthPage extends Vue {
  authStore: AuthStore = proxy.authStore

  async mounted () {
    await $token.reset()

    if (this.$route.query.accessCode) {
      const accessCode = this.$route.query.accessCode
      const loader = $loader.show()
      const accessCodeOk = await this.authStore.onAccessCodeReceived(accessCode as string)
      loader.hide()
      if (accessCodeOk) {
        this.$router.push(NuxtJsRouteHelper.getDefaultAppRoute())
      }
    }
  }
}

</script>
