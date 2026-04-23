// ─── TELA DE LOGIN / CADASTRO ─────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ScrollView, Animated,
    ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography } from '../theme';
import { createUser, loginUser } from '../database/db';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
    const { login } = useAuth();

    // 'login' ou 'register'
    const [mode, setMode] = useState('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Campos
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Animações
    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim  = useRef(new Animated.Value(1)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const logoAnim  = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Logo aparece ao entrar
        Animated.spring(logoAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
        }).start();
    }, []);

    const switchMode = (newMode) => {
        if (newMode === mode) return;
        setError('');
        Animated.parallel([
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }),
        ]).start(() => {
        setMode(newMode);
        setName(''); setEmail(''); setPassword(''); setConfirmPassword('');
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
        });
    };

    const shake = () => {
        Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6,   duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
        ]).start();
    };

    const handleSubmit = async () => {
        setError('');

        // Validações
        if (mode === 'register') {
        if (!name.trim()) return showError('Digite seu nome.');
        if (name.trim().length < 2) return showError('Nome muito curto.');
        }
        if (!email.trim()) return showError('Digite seu e-mail.');
        if (!email.includes('@')) return showError('E-mail inválido.');
        if (!password) return showError('Digite sua senha.');
        if (password.length < 6) return showError('A senha precisa ter pelo menos 6 caracteres.');
        if (mode === 'register' && password !== confirmPassword) {
        return showError('As senhas não coincidem.');
        }

        setLoading(true);
        try {
        let userData;
        if (mode === 'login') {
            userData = await loginUser(email, password);
        } else {
            userData = await createUser(name, email, password);
        }
        login(userData);
        } catch (err) {
        showError(err.message || 'Ocorreu um erro. Tente novamente.');
        } finally {
        setLoading(false);
        }
    };

    const showError = (msg) => {
        setError(msg);
        shake();
    };

    return (
        <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

        {/* Fundo decorativo */}
        <View style={styles.bgGlow1} />
        <View style={styles.bgGlow2} />

        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.flex}
        >
            <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            >
            {/* LOGO */}
            <Animated.View style={[
                styles.logoContainer,
                {
                opacity: logoAnim,
                transform: [{
                    translateY: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                    }),
                }],
                },
            ]}>
                <Text style={styles.logoEmoji}>📚</Text>
                <Text style={styles.logoText}>
                <Text style={styles.logoStudy}>Study</Text>Hub
                </Text>
                <Text style={styles.tagline}>Seu caderno digital pessoal</Text>
            </Animated.View>

            {/* CARD DE LOGIN */}
            <Animated.View style={[
                styles.card,
                { transform: [{ translateX: shakeAnim }] },
            ]}>
                {/* Seletor Login / Cadastro */}
                <View style={styles.modeSwitcher}>
                <TouchableOpacity
                    style={[styles.modeBtn, mode === 'login' && styles.modeBtnActive]}
                    onPress={() => switchMode('login')}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.modeBtnText, mode === 'login' && styles.modeBtnTextActive]}>
                    Entrar
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modeBtn, mode === 'register' && styles.modeBtnActive]}
                    onPress={() => switchMode('register')}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.modeBtnText, mode === 'register' && styles.modeBtnTextActive]}>
                    Cadastrar
                    </Text>
                </TouchableOpacity>
                </View>

                {/* FORMULÁRIO */}
                <Animated.View style={{ opacity: fadeAnim }}>
                {mode === 'register' && (
                    <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Nome</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Seu nome"
                        placeholderTextColor={colors.textDim}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        returnKeyType="next"
                    />
                    </View>
                )}

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>E-mail</Text>
                    <TextInput
                    style={styles.input}
                    placeholder="seu@email.com"
                    placeholderTextColor={colors.textDim}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    returnKeyType="next"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Senha</Text>
                    <View style={styles.passwordRow}>
                    <TextInput
                        style={[styles.input, styles.passwordInput]}
                        placeholder={mode === 'login' ? '••••••' : 'Mínimo 6 caracteres'}
                        placeholderTextColor={colors.textDim}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        returnKeyType={mode === 'login' ? 'done' : 'next'}
                        onSubmitEditing={mode === 'login' ? handleSubmit : undefined}
                    />
                    <TouchableOpacity
                        style={styles.eyeBtn}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                    </View>
                </View>

                {mode === 'register' && (
                    <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Confirmar Senha</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Repita a senha"
                        placeholderTextColor={colors.textDim}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showPassword}
                        returnKeyType="done"
                        onSubmitEditing={handleSubmit}
                    />
                    </View>
                )}

                {/* ERRO */}
                {error ? (
                    <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️  {error}</Text>
                    </View>
                ) : null}

                {/* BOTÃO SUBMIT */}
                <TouchableOpacity
                    style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.85}
                >
                    {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                    ) : (
                    <Text style={styles.submitBtnText}>
                        {mode === 'login' ? 'Entrar' : 'Criar Conta'}
                    </Text>
                    )}
                </TouchableOpacity>

                {/* Link troca de modo */}
                <TouchableOpacity
                    onPress={() => switchMode(mode === 'login' ? 'register' : 'login')}
                    style={styles.switchLink}
                >
                    <Text style={styles.switchLinkText}>
                    {mode === 'login'
                        ? 'Não tem conta? '
                        : 'Já tem conta? '}
                    <Text style={styles.switchLinkBold}>
                        {mode === 'login' ? 'Cadastre-se' : 'Faça login'}
                    </Text>
                    </Text>
                </TouchableOpacity>
                </Animated.View>
            </Animated.View>

            {/* Nota offline */}
            <Text style={styles.offlineNote}>
                🔒 Seus dados ficam salvos apenas no seu celular
            </Text>
            </ScrollView>
        </KeyboardAvoidingView>
        </SafeAreaView>
    );
    }

    const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    flex: {
        flex: 1,
    },
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: spacing.lg,
        paddingVertical: spacing.xxl,
    },

    // Fundo decorativo
    bgGlow1: {
        position: 'absolute',
        top: -80,
        left: -80,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(233, 69, 96, 0.06)',
    },
    bgGlow2: {
        position: 'absolute',
        bottom: -100,
        right: -80,
        width: 350,
        height: 350,
        borderRadius: 175,
        backgroundColor: 'rgba(15, 52, 96, 0.15)',
    },

    // Logo
    logoContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    logoEmoji: {
        fontSize: 52,
        marginBottom: spacing.sm,
    },
    logoText: {
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
        fontSize: typography.xxl,
        fontWeight: typography.black,
        color: colors.text,
        letterSpacing: -0.5,
    },
    logoStudy: {
        color: colors.accent,
    },
    tagline: {
        fontSize: typography.sm,
        color: colors.textDim,
        marginTop: spacing.xs,
        letterSpacing: 0.3,
    },

    // Card
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        ...{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 10,
        },
    },

    // Seletor de modo
    modeSwitcher: {
        flexDirection: 'row',
        backgroundColor: colors.bg,
        borderRadius: radius.full,
        padding: 4,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    modeBtn: {
        flex: 1,
        paddingVertical: spacing.sm + 2,
        alignItems: 'center',
        borderRadius: radius.full,
    },
    modeBtnActive: {
        backgroundColor: colors.accent,
    },
    modeBtnText: {
        fontSize: typography.sm + 1,
        fontWeight: typography.semibold,
        color: colors.textMuted,
    },
    modeBtnTextActive: {
        color: '#fff',
    },

    // Inputs
    inputGroup: {
        marginBottom: spacing.md,
    },
    inputLabel: {
        fontSize: typography.xs + 1,
        fontWeight: typography.semibold,
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: spacing.xs,
    },
    input: {
        backgroundColor: colors.bg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 4,
        color: colors.text,
        fontSize: typography.base,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    passwordRow: {
        position: 'relative',
    },
    passwordInput: {
        paddingRight: spacing.xxl + spacing.xs,
    },
    eyeBtn: {
        position: 'absolute',
        right: spacing.md,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    eyeIcon: {
        fontSize: 18,
    },

    // Erro
    errorBox: {
        backgroundColor: 'rgba(233, 69, 96, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(233, 69, 96, 0.3)',
        borderRadius: radius.md,
        padding: spacing.sm + 2,
        marginBottom: spacing.md,
    },
    errorText: {
        color: colors.accent,
        fontSize: typography.sm,
        fontWeight: typography.medium,
    },

    // Botão submit
    submitBtn: {
        backgroundColor: colors.accent,
        borderRadius: radius.full,
        paddingVertical: spacing.md,
        alignItems: 'center',
        marginTop: spacing.xs,
        ...{
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
        },
    },
    submitBtnDisabled: {
        opacity: 0.7,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: typography.base + 1,
        fontWeight: typography.bold,
        letterSpacing: 0.3,
    },

    // Link
    switchLink: {
        alignItems: 'center',
        marginTop: spacing.md,
        paddingVertical: spacing.xs,
    },
    switchLinkText: {
        fontSize: typography.sm + 1,
        color: colors.textMuted,
    },
    switchLinkBold: {
        color: colors.accent,
        fontWeight: typography.bold,
    },

    offlineNote: {
        textAlign: 'center',
        color: colors.textDim,
        fontSize: typography.xs + 1,
        marginTop: spacing.xl,
    },
});