<script setup>
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
</script>

<template>
  <header class="sticky top-0 z-30 bg-background/80 backdrop-blur border-b">
    <div class="mx-auto max-w-screen-2xl px-4 h-14 flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <h1 class="text-base font-semibold leading-none">用户管理</h1>
        <span class="text-muted-foreground hidden sm:inline">·</span>
        <p class="text-sm text-muted-foreground hidden sm:inline">查看与维护用户数据</p>
      </div>

      <div class="flex items-center gap-2">
        <Input placeholder="全局搜索…" class="w-48 md:w-64" />
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" class="gap-2">
              <Avatar class="h-5 w-5">
                <AvatarImage src="" />
                <AvatarFallback>TP</AvatarFallback>
              </Avatar>
              我
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-44">
            <DropdownMenuItem>个人中心</DropdownMenuItem>
            <DropdownMenuItem>设置</DropdownMenuItem>
            <DropdownMenuItem class="text-destructive">退出登录</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
</template>
