<script setup>
import { mdiMonitorCellphone, mdiTableBorder, mdiTableOff, mdiGithub } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import NotificationBar from '@/components/NotificationBar.vue'
import TableUser from '@/components/TableOrderOptionFeeReports.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticatedX.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BaseButton from '@/components/BaseButton.vue'
import CardBoxComponentEmpty from '@/components/CardBoxComponentEmpty.vue'
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiTableBorder" title="Order Option Fee Reports" main>
      </SectionTitleLineWithButton>

     
        <TableUser checkable />
     
    </SectionMain>
  </LayoutAuthenticated>
</template>
