<script setup>
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loginApi } from '@/api';
import { setAuthToken } from '@/utils/auth';

const props = defineProps({
  class: { type: null, required: false },
});

const router = useRouter();
const route = useRoute();

const form = reactive({
  username: '',
  password: '',
});

const loading = ref(false);
const errorMessage = ref('');

async function handleSubmit(event) {
  event.preventDefault();
  if (loading.value) return;

  errorMessage.value = '';

  try {
    loading.value = true;
    const response = await loginApi({
      username: form.username.trim(),
      password: form.password,
    });

    if (!response?.ok) {
      throw new Error(response?.msg || '登录失败');
    }

    setAuthToken('1');

    const target = route.query.redirect || '/dashboard/TeamCard';
    router.replace(String(target));
  } catch (error) {
    errorMessage.value = error.message || '登录失败';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card class="overflow-hidden p-0">
      <CardContent class="grid p-0 md:grid-cols-2">
        <form class="p-6 md:p-8" @submit="handleSubmit">
          <div class="flex flex-col gap-6">
            <div class="flex flex-col items-center text-center">
              <h1 class="text-2xl font-bold">登录 Team Plus 控制台</h1>
              <p class="text-muted-foreground text-balance">
                输入管理员账号开始管理数据
              </p>
            </div>

            <Alert v-if="errorMessage" variant="destructive">
              <AlertDescription>{{ errorMessage }}</AlertDescription>
            </Alert>

            <div class="grid gap-3">
              <Label for="username">管理员账号</Label>
              <Input
                id="username"
                v-model="form.username"
                type="text"
                placeholder="admin"
                autocomplete="username"
                required
              />
            </div>

            <div class="grid gap-3">
              <div class="flex items-center">
                <Label for="password">密码</Label>
              </div>
              <Input
                id="password"
                v-model="form.password"
                type="password"
                autocomplete="current-password"
                required
              />
            </div>

            <Button type="submit" class="w-full" :disabled="loading">
              {{ loading ? '登录中...' : '登录' }}
            </Button>
          </div>
        </form>

        <div class="bg-muted relative hidden md:block">
          <img
            src="../assets/placeholder.svg"
            alt="登录封面"
            class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </CardContent>
    </Card>
  </div>
</template>
