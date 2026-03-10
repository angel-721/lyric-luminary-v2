<script lang="ts">
</script>

<div class="bulb-container">
	<svg
		class="bulb-icon"
		xmlns="http://www.w3.org/2000/svg"
		width="120"
		height="120"
		viewBox="0 0 32 32"
		fill="none"
	>
		<!-- Bulb base -->
		<path
			d="M16 2C11.5817 2 8 5.58172 8 10C8 12.8484 9.41669 15.3796 11.6 16.9L11.6 18.4C11.6 18.7314 11.8686 19 12.2 19L19.8 19C20.1314 19 20.4 18.7314 20.4 18.4L20.4 16.9C22.5833 15.3796 24 12.8484 24 10C24 5.58172 20.4183 2 16 2ZM13 21L19 21L19 22L13 22L13 21ZM13 23L19 23L19 24L13 24L13 23Z"
			fill="currentColor"
			class="bulb-fill"
		/>
		<!-- Filament -->
		<path
			d="M14 12L16 10L18 12"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="filament"
		/>
	</svg>
</div>

<style>
	.bulb-container {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 2rem 0;
	}

	.bulb-icon {
		color: var(--accent);
		animation: tilt 1.2s ease-in-out infinite;
		filter: drop-shadow(0 0 20px rgba(245, 166, 35, 0.6));
	}

	.bulb-fill {
		animation: glow 1.2s ease-in-out infinite;
	}

	.filament {
		animation: filament-pulse 1.2s ease-in-out infinite;
	}

	@keyframes tilt {
		0%, 100% {
			transform: rotate(-15deg);
		}
		50% {
			transform: rotate(15deg);
		}
	}

	@keyframes glow {
		0%, 100% {
			filter: brightness(1);
		}
		50% {
			filter: brightness(1.3);
		}
	}

	@keyframes filament-pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}
</style>
