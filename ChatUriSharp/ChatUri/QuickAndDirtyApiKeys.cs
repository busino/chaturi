namespace ChatUri;

public static class QuickAndDirtyApiKeys
{
    public static string AzureApiKey = string.Empty;
    public static string OpenAiKey = string.Empty;

    public static bool KeysAreSet => !string.IsNullOrEmpty(AzureApiKey) && !string.IsNullOrEmpty(OpenAiKey);
}