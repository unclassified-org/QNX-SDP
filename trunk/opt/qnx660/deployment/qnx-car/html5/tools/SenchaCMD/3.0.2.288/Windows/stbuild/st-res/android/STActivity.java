package %s;
import android.app.Activity;
import android.os.Bundle;
import android.view.Window;
import android.content.Intent;
import com.sencha.nimblekit.*;

public class STActivity extends Activity
{
    private static NimbleKit nimblekit = null;
    
	@Override
	public void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		this.requestWindowFeature(Window.FEATURE_NO_TITLE);
		nimblekit = new NimbleKit(this);
	}
    
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent imageReturnedIntent){
        nimblekit.onActivityResult(requestCode, resultCode, imageReturnedIntent);
    }
}
