<template>
  <div class="px-2 sm:px-6 lg:px-6 mt-4 lg:mt-12">
    <div class="max-w-7xl min-h-screen flex flex-col mx-auto pb-20 w-full">
      <!-- Top Section Placeholder -->
      <div class="flex flex-col lg:flex-row lg:space-x-40">
        <!-- Left Column - Title and Details -->
        <div class="mt-4 space-y-4 flex-1">
          <USkeleton class="h-10 w-3/4 sm:w-[550px]" />
          <USkeleton class="h-4 w-1/2 sm:w-[200px]" />
          <USkeleton class="h-4 w-1/2 sm:w-[200px]" />

          <div class="space-y-2">
            <USkeleton class="mt-4 h-4 w-1/3 sm:w-[120px]" />
            <USkeleton class="h-4 w-1/3 sm:w-[120px]" />
            <USkeleton class="h-4 w-1/3 sm:w-[120px]" />
          </div>
        </div>

        <!-- Right Column - Image -->
        <div class="mt-4 lg:mt-0 flex justify-center lg:w-1/2">
          <USkeleton class="h-64 sm:h-[25rem] w-full lg:w-full rounded-xl sm:mt-0 mt-10" />
        </div>
      </div>

      <div class="p-4">
        <!-- Middle Section Placeholder - Ingredients and Steps -->
        <div class="flex flex-col lg:flex-row lg:space-x-8 mt-10 sm:mt-24 w-full">
          <div class="lg:w-1/3 space-y-4">
            <USkeleton class="h-10 w-1/2 sm:w-[250px]" />
            <USkeleton class="h-4 w-2/3" />
            <USkeleton class="h-4 w-2/3" />
            <USkeleton class="h-4 w-2/3" />
            <USkeleton class="h-4 w-2/3" />
          </div>

          <div class="lg:w-2/3 space-y-4 mt-6 lg:mt-0">
            <USkeleton class="h-10 w-1/2 sm:w-[250px]" />
            <USkeleton class="h-4 w-5/6" />
            <USkeleton class="h-4 w-5/6" />
            <USkeleton class="h-4 w-5/6" />
            <USkeleton class="h-4 w-5/6" />
          </div>
        </div>

        <!-- Bottom Section Placeholder - Nutrition Information -->
        <div class="sm:mt-24 mt-10 space-y-4">
          <div class="lg:w-100 space-y-4">
            <USkeleton class="h-10 w-1/2 sm:w-[250px]" />
            <USkeleton class="h-4 w-2/3" />
            <USkeleton class="h-4 w-2/3" />
            <USkeleton class="h-4 w-2/3" />
            <USkeleton class="h-4 w-2/3" />
          </div>
        </div>

        <!-- Footer Placeholder -->
        <div class="mt-12 space-y-4 text-center">
          <USkeleton class="h-6 w-[200px] mx-auto" />
          <USkeleton class="h-4 w-[150px] mx-auto" />
        </div>
      </div>
    </div>
  </div>
</template>
