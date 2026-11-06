package com.noir.musicplayer.ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = NiorPrimaryPurple,
    secondary = NiorSecondaryPurple,
    background = NiorDarkBg,
    surface = NiorDarkCard,
    onPrimary = NiorWhite,
    onSecondary = NiorWhite,
    onBackground = NiorWhite,
    onSurface = NiorWhite,
    outline = NiorBorderDark
)

private val LightColorScheme = lightColorScheme(
    primary = NiorPrimaryPurple,
    secondary = NiorSecondaryPurple,
    background = NiorLightBg,
    surface = NiorLightCard,
    onPrimary = NiorWhite,
    onSecondary = NiorWhite,
    onBackground = NiorPrimaryTextLight,
    onSurface = NiorPrimaryTextLight,
    outline = NiorBorderLight
)

@Composable
fun NiorMusicPlayerTheme(
    darkTheme: Boolean = true,
    accentColor: String = "purple",
    content: @Composable () -> Unit
) {
    val dynamicAccent = when (accentColor.lowercase()) {
        "blue" -> AccentBlue
        "cyan" -> AccentCyan
        "emerald" -> AccentEmerald
        "rose" -> AccentRose
        "amber" -> AccentAmber
        else -> AccentPurple
    }

    val baseColors = if (darkTheme) DarkColorScheme else LightColorScheme
    val customizedColors = baseColors.copy(primary = dynamicAccent)

    MaterialTheme(
        colorScheme = customizedColors,
        typography = Typography,
        content = content
    )
}
