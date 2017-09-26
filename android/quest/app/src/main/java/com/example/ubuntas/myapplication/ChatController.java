package com.example.ubuntas.myapplication;

import java.util.ArrayList;
import java.util.Random;
import java.util.StringTokenizer;

import android.app.Activity;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v7.app.ActionBarActivity;
import android.util.Log;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.view.inputmethod.EditorInfo;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONStringer;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;
import okio.ByteString;

public class ChatController extends WebSocketListener {
    private Activity act = null;

    private EditText msg_edittext;
    private ListView msgListView;
    private String[] messsages = {"123", "456"};
    private ArrayList<String> list;
    private ArrayAdapter<String> adapter;

    private OkHttpClient client;
    private WebSocket socket;

    public void init(Activity activity) {
        act = activity;

        msg_edittext = (EditText) act.findViewById(R.id.messageEditText);
        msgListView = (ListView) act.findViewById(R.id.msgListView);

        list = new ArrayList<String>();
        for (int i = 0; i < messsages.length; ++i) {
            list.add(messsages[i]);
        }
        adapter = new ArrayAdapter(act,
                android.R.layout.simple_list_item_1, list);

        msgListView.setAdapter(adapter);

        msgListView.setTranscriptMode(ListView.TRANSCRIPT_MODE_ALWAYS_SCROLL);
        msgListView.setStackFromBottom(true);

        client = new OkHttpClient();

        Request request = new Request.Builder().url("ws://192.168.0.3:3000").build();
        socket = client.newWebSocket(request, this);
        client.dispatcher().executorService().shutdown();
    }

    private void appendMessage(String text, boolean update) {
        list.add(text);
        if (update)
            adapter.notifyDataSetChanged();
    }

    public void sendMessage() {
            String msg = msg_edittext.getText().toString();
            msg_edittext.getText().clear();

            if (msg.length() > 0) {
                appendMessage(msg, true);
                socket.send("{\"userId\":1243,\"type\":\"text\",\"data\":\""+msg+"\"}");
            }
    }

    private static final int NORMAL_CLOSURE_STATUS = 1000;
    @Override
    public void onOpen(WebSocket webSocket, Response response) {
        socket = webSocket;
    }
    @Override
    public void onMessage(WebSocket webSocket, String text) {
        output("Receiving : " + text);
        try {
            JSONObject obj = new JSONObject(text);
            String type = obj.getString("type");
            if (type.equals("messages")) {
                JSONArray arr = obj.getJSONArray("messages");
                int arraySize = arr.length();
                for(int i = arraySize - 1 ; i >= 0 ; i--) {
                    JSONObject messObj = arr.getJSONObject(i);
                    String messType = messObj.getString("type");
                    String messData = messObj.getString("data");
                    if(messType.equals("text"))
                        appendMessage(messData, i == 0);
                }
            }
        }
        catch (Exception e) {
        }
    }

    @Override
    public void onMessage(WebSocket webSocket, ByteString bytes) {
        output("Receiving bytes : " + bytes.hex());
    }
    @Override
    public void onClosing(WebSocket webSocket, int code, String reason) {
        webSocket.close(NORMAL_CLOSURE_STATUS, null);
        output("Closing : " + code + " / " + reason);
    }
    @Override
    public void onFailure(WebSocket webSocket, Throwable t, Response response) {
        output("Error : " + t.getMessage());
    }

    private void output(final String txt) {
        Log.d("", txt);
    }
}
