
<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import LoginForm from '@/components/LoginForm.vue';
import { isAuthenticated } from '@/utils/auth';

const router = useRouter();

onMounted(() => {
  if (isAuthenticated()) {
    router.replace('/dashboard/TeamCard');
  }
});
</script>

<template>
  <div class="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
    <div class="w-full max-w-sm md:max-w-3xl">
      <LoginForm />
    </div>
  </div>
</template>
