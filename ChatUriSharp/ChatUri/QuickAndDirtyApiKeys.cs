namespace ChatUri;

public static class QuickAndDirtyApiKeys
{
    public static string AzureApiKey = "5553e80a837b4f0584f93878fdcc23d6";
    public static string OpenAiKey = "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";

    public static bool KeysAreSet => !string.IsNullOrEmpty(AzureApiKey) && !string.IsNullOrEmpty(OpenAiKey);
}